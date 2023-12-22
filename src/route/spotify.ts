import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import crypto from "crypto";
import { setCodeVerifer } from "../utils/auth";
import _get from "lodash/get";
import processUtils from "../utils/processUtils";
import httpUtils from "../utils/httpUtils";
import mongoDbUtils from "../utils/mongoDbUtils";
import { routeLink } from "../utils/routeLink";

type SearchRequest = FastifyRequest<{
  Querystring: {
    keyWord: string;
  };
}>;

type AddRequest = FastifyRequest<{
  Querystring: {
    uri: string;
    position: number;
  };
}>;

const spotify = (
  fastify: FastifyInstance,
  opts: FastifyServerOptions,
  done: any
) => {
  fastify.get(routeLink.default, async (request, reply) => {
    return `${process.env.ENV} Spotify API`;
  });

  fastify.get(routeLink.login, async (request, reply) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const params = new URLSearchParams();
    params.append("client_id", clientId!);
    params.append("response_type", "code");
    params.append(
      "redirect_uri",
      `${process.env.BASE_URL}/api/spotify-callback/`
    );
    params.append(
      "scope",
      "user-read-private user-read-playback-state user-modify-playback-state playlist-read-private playlist-modify playlist-modify-private"
    );
    params.append("code_challenge_method", "S256");
    const codeVerifier = generateCodeVerifier(128);
    setCodeVerifer(codeVerifier);
    const codeChallenge = await createCodeChallenge(codeVerifier);
    params.append("code_challenge", codeChallenge);
    reply.redirect(
      `https://accounts.spotify.com/authorize?${params.toString()}`
    );
  });

  // refreshAccessToken
  fastify.get(routeLink.refresh, async (request, reply) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const { refresh_token } = await mongoDbUtils.getTokens(fastify);
    const Params = new URLSearchParams();
    Params.append("client_id", clientId!);
    Params.append("grant_type", "refresh_token");
    Params.append("refresh_token", refresh_token);
    const spotifyResponse = await httpUtils.httpFetchPost({
      url: "https://accounts.spotify.com/api/token",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: Params,
    });
    const new_access_token = _get(spotifyResponse, "access_token");
    const new_refresh_token = _get(spotifyResponse, "refresh_token");
    if (new_access_token && new_refresh_token) {
      await mongoDbUtils.updateTokens(fastify, {
        access_token: new_access_token,
        refresh_token: new_refresh_token,
      });
      return reply.code(200).send(spotifyResponse);
    } else {
      return reply.code(500).send(spotifyResponse);
    }
  });

  // search
  // https://developer.spotify.com/documentation/web-api/reference/search
  fastify.get(
    routeLink.search,
    async (request: SearchRequest, reply: FastifyReply) => {
      try {
        const keyWord = request.query.keyWord;
        const Params = new URLSearchParams();
        Params.append("q", keyWord!);
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
          fastify,
        });
        await processUtils.processResponseAndReturn(spotifyResponse, reply);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );

  // getUserProfile 取得用戶的個人資料
  fastify.get(
    routeLink.getUserProfile,
    async (request: FastifyRequest, reply: FastifyReply) => {
      // https://api.spotify.com/v1/me
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

  // getUserPlaylists 取得用戶的播放清單
  fastify.get(
    routeLink.getUserPlaylists,
    async (request: FastifyRequest, reply: FastifyReply) => {
      // https://api.spotify.com/v1/users/{user_id}/playlists
      const Params = new URLSearchParams();
      Params.append("limit", "10");
      Params.append("offset", "0");
      const userId = await mongoDbUtils.getUserId(fastify);
      const spotifyResponse = await httpUtils.httpFetchGetWithToken({
        url: `https://api.spotify.com/v1/users/${userId}/playlists?${Params.toString()}`,
        fastify,
      });
    }
  );

  // add
  fastify.get(
    routeLink.add,
    async (request: AddRequest, reply: FastifyReply) => {
      const uri = request.query.uri;
      const position = request.query.position;
      // https://api.spotify.com/v1/playlists/{playlist_id}/tracks
      const playlist_id = "5Jjn8bXv6DekewlqTF90pS";
      const Params: { [key: string]: any } = {
        uris: [uri],
        // 不寫的話會預設加到最後一首
        // 那我們可以設定兩個action一個是加到最後一首，一個是加到第一首
      };
      if (position) {
        Params["position"] = position;
      }
      const spotifyResponse = await httpUtils.httpFetchPostWithToken({
        url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
        body: JSON.stringify(Params),
        fastify,
      });
      await processUtils.processResponseAndReturn(spotifyResponse, reply);
    }
  );

  done();
};

function generateCodeVerifier(length: number) {
  const validChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let array = new Uint8Array(length);
  crypto.randomFillSync(array);
  array = array.map((x) => validChars.charCodeAt(x % validChars.length));
  return String.fromCharCode.apply(null, array as any);
}

async function createCodeChallenge(codeVerifier: string) {
  return crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export default spotify;
