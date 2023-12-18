"use strict";

import fastify, {
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import cookie from "@fastify/cookie";
import { FastifyCookieOptions } from "@fastify/cookie";
import spotify from "../function/spotfiy";
import spotifyCallback from "../function/spotify-callback";

const fastifyOptions: FastifyServerOptions = {
  logger: true,
  // disableRequestLogging: false,
};

const server = fastify(fastifyOptions);

// https://github.com/fastify/fastify-cookie
server.register(cookie, {
  secret: "my-secret", // for cookies signature
  parseOptions: {}, // options for parsing cookies
} as FastifyCookieOptions);

server.register(spotify, { prefix: "/" });

server.register(spotifyCallback, { prefix: "/api/spotify-callback" });

server.get("/", async (request, reply) => {
  return "Hello World";
});

export default async (req: FastifyRequest, res: FastifyReply) => {
  await server.ready();
  server.server.emit("request", req, res);
};

// server.listen({ port: 3000 }, (err, address) => {
//   if (err) {
//     console.error(err);
//     process.exit(1);
//   }
//   console.log(`Server listening at ${address}`);
// });
