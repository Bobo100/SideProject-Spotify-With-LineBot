import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import crypto from "crypto";
import {
  WebhookEvent,
  MessageEvent,
  PostbackEvent,
  TextEventMessage,
  EventMessage,
} from "@line/bot-sdk";
import _get from "lodash/get";
import processUtils from "../utils/processhUtils";
import lineUtils from "../utils/lineUtils";
import { filterSearchType } from "../utils/lineType";
import _isEqual from "lodash/isEqual";

type LineWebhookRequestBody = {
  events: MessageEvent[];
};

type MyRequest = FastifyRequest<{
  Body: WebhookEvent;
}>;

const Commands = {
  ADD_TRACK: "ADD_TRACK",
  SEARCH_MORE: "SEARCH_MORE",
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
    switch (body.type) {
      case "message":
        handleMessageEvent(body.message, body.replyToken);
        break;
      case "postback":
        handlePostbackEvent(body);
        break;
      default:
        break;
    }

    return reply.status(200).send("ok");
  });

  done();
};

const handleMessageEvent = async (
  eventMessage: EventMessage,
  replyToken: string
) => {
  const type = eventMessage.type;
  switch (type) {
    case "text":
      const text = eventMessage.text;
      handleTextEventMessage(text, replyToken);
      break;
    default:
      break;
  }
};

const handlePostbackEvent = async (postbackEvent: PostbackEvent) => {
  const { data, params = "" } = postbackEvent.postback;
  const replyToken = postbackEvent.replyToken;
  // 根據回傳的data來做不同的處理
  return;
};

const handleTextEventMessage = async (text: string, replyToken: string) => {
  const encodedKeyword = encodeURIComponent(text);
  const searchResponse = await fetch(
    `${process.env.BASE_URL}/search?keyWord=${encodedKeyword}`
  );
  if (_isEqual(searchResponse.status, 200)) {
    const searchData = await searchResponse.json();
    const { result, nextUrl, limit, offset, total } =
      processUtils.filterSearch(searchData);

    const message = await lineUtils.generateMessageTemplate();
    message.contents.body.contents = result.map((item: filterSearchType) => {
      return lineUtils.generateFlexbox(item);
    });

    // 這邊要來做flex message
    await lineUtils.replayMessage(replyToken, {
      type: "text",
      text: message,
    });
  }
};

const handleTypePostback = async (
  body: PostbackEvent,
  fastify: FastifyInstance
) => {};

export default webhook;
