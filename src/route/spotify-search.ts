import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import _get from "lodash/get";
import processUtils from "../utils/processUtils";
import httpUtils from "../utils/httpUtils";
import { searchLink } from "../utils/routeLink";

type SearchRequest = FastifyRequest<{
  Querystring: {
    keyWord: string;
  };
}>;

const search = (
  fastify: FastifyInstance,
  opts: FastifyServerOptions,
  done: any
) => {
  /**
   * @api {get} /search 取得搜尋結果
   * @apiParam {String} keyWord 搜尋關鍵字
   * https://developer.spotify.com/documentation/web-api/reference/search
   */
  fastify.get(
    searchLink.default,
    async (request: SearchRequest, reply: FastifyReply) => {
      try {
        const keyWord = request.query.keyWord;
        const Params = new URLSearchParams();
        Params.append("query", keyWord!);
        // 可帶複數的type，但我想先不用
        Params.append("type", "track");
        // 限定台灣
        Params.append("market", "TW");
        // 一次顯示幾筆
        Params.append("limit", "10");
        // offset用來做分頁
        Params.append("offset", "0");
        const spotifyResponse = await httpUtils.httpFetchGetWithToken({
          url: "https://api.spotify.com/v1/search?" + Params.toString(),
        });
        await processUtils.processResponseAndReturn(spotifyResponse, reply);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );
  done();
};

export default search;
