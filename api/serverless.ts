// Read the .env file.
import dotenv from "dotenv";
dotenv.config({ path: `.env.local`, override: true });

// Require the framework
import Fastify from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import cookie from "@fastify/cookie";
import { FastifyCookieOptions } from "@fastify/cookie";
import spotify from "../src/route/spotify";
import spotifyCallback from "../src/route/spotify-callback";
import webhook from "../src/route/webhook";
import mongodb from "@fastify/mongodb";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});


app.register(mongodb, {
  url: `mongodb+srv://${process.env.USER_NAME}:${process.env.MONGODB_PASSEWORD}@cluster0.yjz075d.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`,
});

app.register(cookie, {
  secret: "my-secret", // for cookies signature
  parseOptions: {}, // options for parsing cookies
} as FastifyCookieOptions);

app.register(spotify, {
  prefix: "/",
});

app.register(spotifyCallback, { prefix: "/api/spotify-callback" });

app.register(webhook, { prefix: "/webhook" });

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

export default async (req: FastifyRequest, res: FastifyReply) => {
  await app.ready();
  app.server.emit("request", req, res);
};
