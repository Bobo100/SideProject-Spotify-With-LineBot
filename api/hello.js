"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hello = (fastify, opts, done) => {
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
exports.default = hello;
