// Read the .env file.
import * as dotenv from "dotenv";
dotenv.config();

// Require the framework
import Fastify from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import cookie from "@fastify/cookie";
import { FastifyCookieOptions } from "@fastify/cookie";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});

app.register(cookie, {
  secret: "my-secret", // for cookies signature
  parseOptions: {}, // options for parsing cookies
} as FastifyCookieOptions);

// Register your application as a normal plugin.
app.register(import("../src/index"), {
  prefix: "/",
});

export default async (req: FastifyRequest, res: FastifyReply) => {
  await app.ready();
  app.server.emit("request", req, res);
};
