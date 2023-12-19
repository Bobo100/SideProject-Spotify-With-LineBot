import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import crypto from "crypto";

type MyRequest = FastifyRequest<{
  Querystring: {
    keyWord: string;
  };
}>;

const isDev = () => process.env.ENV === "development";

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
    const redirectUri = isDev()
      ? "http://localhost:3000/api/spotify-callback/"
      : "https://side-project-spotify-with-line-bot.vercel.app/api/spotify-callback/";
    params.append("redirect_uri", redirectUri);
    params.append(
      "scope",
      "user-read-private user-read-email user-read-playback-state user-modify-playback-state"
    );
    // 為了防止CSRF攻擊，我們需要在發送請求時，帶上code_challenge_method和code_challenge
    params.append("code_challenge_method", "S256");
    const codeVerifier = generateCodeVerifier(128);
    reply.setCookie("codeVerifier", codeVerifier, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    });
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
      reply.setCookie("access_token", access_token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 3600,
      });
      reply.setCookie("refresh_token", refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // 永久直到有新的token
      });
      return `Success Refresh`;
    } else {
      return `Fail Refresh`;
    }
  });

  // search
  // https://developer.spotify.com/documentation/web-api/reference/search
  fastify.get("/search", async (request: MyRequest, reply: FastifyReply) => {
    const keyWord = request.query.keyWord;
    const access_token = request.cookies.access_token;
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
    return data;
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
