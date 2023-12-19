import fastify, {
  FastifyServerOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";

const fastifyOptions: FastifyServerOptions = {
  logger: true,
};

const server = fastify(fastifyOptions);

server.register(import("../functions/index"), {
  prefix: "/",
});

export default async (req: FastifyRequest, res: FastifyReply) => {
  await server.ready();
  server.server.emit("request", req, res);
};
