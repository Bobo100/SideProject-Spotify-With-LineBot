import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import crypto from "crypto";
import { MessageEvent } from "@line/bot-sdk";
import _get from "lodash/get";

import processUtils from "../utils/processhUtils";

type LineWebhookRequestBody = {
  events: MessageEvent[];
};

type MyRequest = FastifyRequest<{
  Body: LineWebhookRequestBody;
}>;

const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + process.env.LINE_CHANNEL_ACCESS_TOEKN,
};

// 1. 用戶向 LineBot 發送訊息。
// 2. LineBot 將此訊息發送到您的 Vercel 伺服器上的 Webhook URL。
// 3. 您的 Vercel 伺服器接收訊息，並將其拆解。
// 4. 您的 Vercel 伺服器觸發另一個 URL（在同一個伺服器上），以執行音樂搜索。
// 5. 音樂搜索服務返回結果，並將其發回給您的 Vercel 伺服器。
// 6. 您的 Vercel 伺服器將結果發回給 LineBot。
// 7. LineBot 將結果發回給用戶。
const webhook = (
  fastify: FastifyInstance,
  opts: FastifyServerOptions,
  done: any
) => {
  fastify.post("/", async (request: MyRequest, reply: FastifyReply) => {
    const r = JSON.stringify(request.body);
    const signature = crypto
      .createHmac("SHA256", process.env.LINE_CHANNEL_SECRET!)
      .update(r || "")
      .digest("base64")
      .toString();
    if (signature !== request.headers["x-line-signature"]) {
      return reply.status(401).send("Unauthorized");
    }
    // TODO: 要拆分出message 和 postback
    // 因為我們會回給user flex message
    // 用戶點選flex message的按鈕
    // 會觸發postback
    // 這個postback也會被送到webhook 那要做的事情是把該postback的data 加入到spotify的播放清單中
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
    const searchData = await searchResponse.json();
    const { result, nextUrl, limit, offset, total } = processUtils.filterSearch(
      searchData
    );
    /* 先放postback的範例 
      那預計會帶的是"data": "uri=spotify:track:7xGfFoTpQ2E7fRF5lN10tr" 
      以及 有可能是"data": "limit=limit&offset=offset&total=total" 這樣的資料 
      目的是使用者如果點選了下一頁的按鈕 要能夠知道要去哪裡取得下一頁的資料
      {
        "type": "postback",
        "label": "Buy",
        "data": "action=buy&itemid=111",
        "displayText": "Buy",
        "inputOption": "openKeyboard",
        "fillInText": "---\nName: \nPhone: \nBirthday: \n---"
      }
    */
    await replayMessage(event.replyToken, {
      type: "text",
      text: "這裡是你的 Spotify 搜尋結果：" + nextUrl,
    });
    return reply.status(200).send("ok");
  });

  done();
};

const replayMessage = async (replyToken: string, message: any) => {
  try {
    await fetch(`${process.env.LINE_MESSAGING_API}/reply`, {
      method: "POST",
      headers: LINE_HEADER,
      body: JSON.stringify({
        replyToken: replyToken,
        messages: [message],
      }),
    });
  } catch (error) {
    console.error(`Delivery to LINE failed (${error})`);
  }
};

export default webhook;
