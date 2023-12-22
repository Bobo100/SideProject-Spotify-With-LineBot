import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { getCodeVerifer } from "../utils/auth";
import httpUtils from "../utils/httpUtils";
import mongoDbUtils from "../utils/mongoDbUtils";
import { routeLink } from "../utils/routeLink";

type MyRequest = FastifyRequest<{
  Querystring: {
    code: string;
  };
}>;

const spotifyCallback = (
  fastify: FastifyInstance,
  opts: FastifyServerOptions,
  done: any
) => {
  fastify.get(
    routeLink.default,
    async (request: MyRequest, reply: FastifyReply) => {
      const code = request.query.code;
      if (code) {
        try {
          const clientId = process.env.SPOTIFY_CLIENT_ID;
          const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
          const params = new URLSearchParams();
          params.append("client_id", clientId!);
          params.append("client_secret", clientSecret!);
          params.append("grant_type", "authorization_code");
          params.append("code", code);
          params.append(
            "redirect_uri",
            `${process.env.BASE_URL}/api/spotify-callback/`
          );
          const codeVerifier = getCodeVerifer();
          params.append("code_verifier", codeVerifier!);
          const result = await httpUtils.httpFetchPost({
            url: "https://accounts.spotify.com/api/token",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
          });
          const { access_token, refresh_token } = result;
          if (access_token && refresh_token) {
            await mongoDbUtils.updateTokens(fastify, {
              access_token: access_token,
              refresh_token: refresh_token,
            });
            await httpUtils.httpFetchGet({
              url: process.env.BASE_URL + "/getUserProfile",
            });
            return `success! access_token: ${access_token}, refresh_token: ${refresh_token}`;
          } else {
            return `Failed!`;
          }
        } catch (error) {}
      } else {
        reply.redirect(process.env.BASE_URL as string);
      }
    }
  );

  done();
};

export default spotifyCallback;
