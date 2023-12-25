import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import _get from "lodash/get";
import httpUtils from "../utils/httpUtils";
import mongoDbUtils from "../utils/mongoDbUtils";
import { userLink } from "../utils/routeLink";

const user = (
  fastify: FastifyInstance,
  opts: FastifyServerOptions,
  done: any
) => {
  /**
   * @api {get} /user/profile 取得用戶的個人資料
   */
  fastify.get(
    userLink.profile,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const spotifyResponse = await httpUtils.httpFetchGetWithToken({
        url: "https://api.spotify.com/v1/me",
        fastify,
      });
      const errorStatus = _get(spotifyResponse, "error.status");
      if (errorStatus) {
        return;
      } else {
        const userId = _get(spotifyResponse, "id");
        await mongoDbUtils.updateUserId(fastify, userId);
        return userId;
      }
    }
  );

  done();
};

export default user;
