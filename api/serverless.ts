// Read the .env file.
import * as dotenv from "dotenv";
dotenv.config();

// Require the framework
import Fastify from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import cookie from "@fastify/cookie";
import { FastifyCookieOptions } from "@fastify/cookie";
import spotify from "../src/route/spotify";
import spotifyCallback from "../src/route/spotify-callback";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});

app.register(cookie, {
  secret: "my-secret", // for cookies signature
  parseOptions: {}, // options for parsing cookies
} as FastifyCookieOptions);

app.register(spotify, {
  prefix: "/",
});

app.register(spotifyCallback, { prefix: "/api/spotify-callback" });

export default async (req: FastifyRequest, res: FastifyReply) => {
  await app.ready();
  app.server.emit("request", req, res);
};
