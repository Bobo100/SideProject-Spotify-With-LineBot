import {
  FastifyInstance,
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { getCodeVerifer } from "../utils/auth";

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
        const result = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        });
        const data = await result.json();
        const { access_token, refresh_token } = data;
        if (access_token && refresh_token) {
          await fastify.mongo.db?.collection("token").updateOne(
            {},
            {
              $set: {
                access_token,
                refresh_token,
              },
            },
            { upsert: true }
          );
          return `Success Login`;
        } else {
          return `Fail Login`;
        }
      } catch (error) {}
    } else {
      reply.redirect(process.env.BASE_URL as string);
    }
  });

  done();
};

export default spotifyCallback;
