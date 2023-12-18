import fastify, { FastifyServerOptions } from "fastify";
import cookie from "@fastify/cookie";
import { FastifyCookieOptions } from "@fastify/cookie";
import spotify from "./api/spotfiy";
import spotifyCallback from "./api/spotify-callback";

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

server.register(spotify, { prefix: "/spotify" });

server.register(spotifyCallback, { prefix: "/api/spotify-callback" });

server.get("/", async (request, reply) => {
  return "Hello World";
});

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
