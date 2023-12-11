import { FastifyInstance } from "fastify";

const hello = (fastify: FastifyInstance, opts: any, done: any) => {
  // 路徑會等於/hello/
  fastify.get("/", async (request, reply) => {
    return "hello world\n";
  });

  // 路徑會等於/hello/ping
  fastify.get("/ping", async (request, reply) => {
    return "pong\n";
  });

  done();
};

export default hello;
