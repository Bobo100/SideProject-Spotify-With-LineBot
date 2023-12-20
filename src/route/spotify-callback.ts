import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import {
  setCodeVerifer,
  getCodeVerifer,
  setToken,
  getToken,
  token_type,
} from "../utils/auth";

type MyRequest = FastifyRequest<{
  Querystring: {
    code: string;
  };
}>;

const isDev = () => process.env.ENV === "development";

const spotifyCallback = (
  fastify: FastifyInstance,
  opts: FastifyServerOptions,
  done: any
) => {
  fastify.get("/", async (request: MyRequest, reply: FastifyReply) => {
    const code = request.query.code;
    if (code) {
      try {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        // 設置從spotify的redirect_uri 記得spotify的Dashboard要設定
        // 才能正確的redirect 獲得我們要的token
        const url =
          // "https://side-project-spotify-with-line-bot.vercel.app";
          "https://side-project-spotify-with-line-bot-git-branch-20231231-bobo100.vercel.app";
        const redirectUri = isDev()
          ? "http://localhost:3000/api/spotify-callback/"
          : `${url}/api/spotify-callback/`;
        const params = new URLSearchParams();
        params.append("client_id", clientId!);
        params.append("client_secret", clientSecret!);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", redirectUri);
        // const codeVerifier = request.cookies.codeVerifier;
        const codeVerifier = getCodeVerifer();
        params.append("code_verifier", codeVerifier!);
        const result = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        });
        const data = await result.json();
        const { access_token, refresh_token } = data;
        // 把access_token和refresh_token存到cookie
        if (access_token && refresh_token) {
          setToken(access_token, token_type.accessToken);
          setToken(refresh_token, token_type.refreshToken);
          return `Success Login`;
        } else {
          return `Fail Login`;
        }
      } catch (error) {}
    } else {
      const url =
        // "https://side-project-spotify-with-line-bot.vercel.app";
        "https://side-project-spotify-with-line-bot-git-branch-20231231-bobo100.vercel.app";
      const redirectUri = isDev()
        ? "http://localhost:3000"
        : `${url}`;
      reply.redirect(redirectUri);
    }
  });

  done();
};

export default spotifyCallback;
