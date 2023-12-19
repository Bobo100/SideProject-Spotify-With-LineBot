import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import "dotenv/config";

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
  fastify.get("/", async (request: MyRequest, reply: FastifyReply) => {
    const code = request.query.code;
    if (code) {
      try {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
        // 設置從spotify的redirect_uri 記得spotify的Dashboard要設定
        // 才能正確的redirect 獲得我們要的token
        const redirectUri = "http://localhost:3000/api/spotify-callback/";
        const params = new URLSearchParams();
        params.append("client_id", clientId!);
        params.append("client_secret", clientSecret!);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", redirectUri);
        const codeVerifier = request.cookies.codeVerifier;
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
          return `Success Login`;
        } else {
          return `Fail Login`;
        }
      } catch (error) {}
    } else {
      reply.redirect(`http://localhost:3000/`);
    }
  });

  done();
};

export default spotifyCallback;