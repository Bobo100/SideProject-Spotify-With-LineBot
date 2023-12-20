import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import crypto from "crypto";
import line, {
  // main APIs
  middleware,
  // exceptions
  JSONParseError,
  SignatureValidationFailed,
  // types
  TemplateMessage,
  WebhookEvent,
  MessageEvent,
  TextEventMessage,
} from "@line/bot-sdk";
import _get from "lodash/get";

import processUtils from "../utils/processhUtils";

type LineWebhookRequestBody = {
  events: MessageEvent[];
};

type MyRequest = FastifyRequest<{
  Body: LineWebhookRequestBody;
}>;

// https://www.youtube.com/watch?v=btGtOue1oDA
const webhook = (
  fastify: FastifyInstance,
  opts: FastifyServerOptions,
  done: any
) => {
  fastify.post("/", async (request: MyRequest, reply: FastifyReply) => {
    // 1. 用戶向 LineBot 發送訊息。
    // 2. LineBot 將此訊息發送到您的 Vercel 伺服器上的 Webhook URL。
    // 3. 您的 Vercel 伺服器接收訊息，並將其拆解。
    // 4. 您的 Vercel 伺服器觸發另一個 URL（在同一個伺服器上），以執行音樂搜索。
    // 5. 音樂搜索服務返回結果，並將其發回給您的 Vercel 伺服器。
    // 6. 您的 Vercel 伺服器將結果發回給 LineBot。
    // 7. LineBot 將結果發回給用戶。
    const r = JSON.stringify(request.body);
    const signature = crypto
      .createHmac("SHA256", process.env.LINE_CHANNEL_SECRET!)
      .update(r || "")
      .digest("base64")
      .toString();
    if (signature !== request.headers["x-line-signature"]) {
      return reply.status(401).send("Unauthorized");
    }
    //  Maybe refer: https://qiita.com/bathtimefish/items/77453b367ce634f7d677
    const body = request.body;
    const event = _get(body, "events[0]");
    const eventType = _get(event, "type");
    if (eventType != "message") {
      return reply.status(200).send("Not message event");
    }
    const eventMessage = _get(event, "message");
    const messageType = _get(eventMessage, "type");
    if (messageType != "text") {
      return reply.status(200).send("Not text message");
    }
    const messageText = _get(eventMessage, "text", "");
    const encodedKeyword = encodeURIComponent(messageText);
    const searchResponse = await fetch(
      `${process.env.BASE_URL}/search?keyWord=${encodedKeyword}`
    );
    if (searchResponse.status !== 200) {
      throw new Error("無法取得搜尋結果");
    }
    // const searchData = await searchResponse.json();
    await sendMessages(event, 'searchData');
    return reply.status(200).send('ok');
  });

  done();
};

const sendMessages = async (event: MessageEvent, data: any) => {
  const client = new line.Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOEKN as string,
  });
  const message = {
    type: "text",
    text: "這裡是你的 Spotify 搜尋結果：" + JSON.stringify(data),
  } as TextEventMessage;
  await client.replyMessage(event.replyToken, message);
};

export default webhook;
