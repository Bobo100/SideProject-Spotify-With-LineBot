import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import crypto from "crypto";
import { setCodeVerifer } from "../utils/auth";
import _get from "lodash/get";
import lineUtils from "../utils/lineUtils";

type MyRequest = FastifyRequest<{
  Querystring: {
    keyWord: string;
    replyToken: string;
  };
}>;

// https://www.youtube.com/watch?v=btGtOue1oDA
const spotify = (
  fastify: FastifyInstance,
  opts: FastifyServerOptions,
  done: any
) => {
  fastify.get("/", async (request, reply) => {
    return `${process.env.ENV} Spotify API`;
  });

  fastify.get("/login", async (request, reply) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const params = new URLSearchParams();
    params.append("client_id", clientId!);
    params.append("response_type", "code");
    // 導向到我們的callback
    params.append(
      "redirect_uri",
      `${process.env.BASE_URL}/api/spotify-callback/`
    );
    params.append(
      "scope",
      "user-read-private user-read-playback-state user-modify-playback-state playlist-read-private playlist-modify playlist-modify-private"
    );
    // 為了防止CSRF攻擊，我們需要在發送請求時，帶上code_challenge_method和code_challenge
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
  fastify.get("/refresh", async (request, reply) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const refreshToken = request.cookies.refresh_token;
    const Params = new URLSearchParams();
    Params.append("client_id", clientId!);
    Params.append("grant_type", "refresh_token");
    Params.append("refresh_token", refreshToken!);
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: Params,
    });
    const data = await result.json();
    const { access_token, refresh_token } = data;
    if (access_token && refresh_token) {
      fastify.mongo.db?.collection("token").updateOne(
        {},
        {
          $set: {
            access_token,
            refresh_token,
          },
        },
        { upsert: true }
      );
      return `Success Refresh`;
    } else {
      return `Fail Refresh`;
    }
  });

  // search
  // https://developer.spotify.com/documentation/web-api/reference/search
  fastify.get("/search", async (request: MyRequest, reply: FastifyReply) => {
    try {
      const keyWord = request.query.keyWord;
      const token = await fastify.mongo.db?.collection("token").findOne({});
      const access_token = _get(token, "access_token");
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
      const spotifyResponse = await fetch(
        `https://api.spotify.com/v1/search?${Params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const data = await spotifyResponse.json();
      const errorStatus = _get(data, "error.status");     
      if (errorStatus) {
        reply.code(errorStatus).send(data);
      } else {
        reply.code(200).send(data);
      }
    } catch (error) {
      reply.code(500).send(error);
    }
  });

  fastify.get("/add", async (request: MyRequest, reply: FastifyReply) => {
    // https://api.spotify.com/v1/playlists/{playlist_id}/tracks
    /* request body
    {
      "uris": [
          "string"
      ],
      "position": 0
    }
    */
    const token = await fastify.mongo.db?.collection("token").findOne({});
    const access_token = _get(token, "access_token");
    const playlist_id = "5Jjn8bXv6DekewlqTF90pS";
    const Params = {
      uris: ["spotify:track:2A0vCSTeOryiLsbuWDwX7G"],
      position: 0,
    };
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(Params),
      }
    );
  });

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
