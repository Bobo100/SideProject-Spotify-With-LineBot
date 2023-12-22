import { FastifyInstance } from "fastify";
import _get from "lodash/get";
const utils = {
  getTokens: async (fastify: FastifyInstance) => {
    const token = await fastify.mongo.db?.collection("token").findOne({});
    const access_token = _get(token, "access_token");
    const refresh_token = _get(token, "refresh_token");
    return {
      access_token,
      refresh_token,
    };
  },
  updateTokens: async (fastify: FastifyInstance, tokens: any) => {
    fastify.mongo.db?.collection("token").updateOne(
      {},
      {
        $set: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        },
      },
      { upsert: true }
    );
  },
  getUserId: async (fastify: FastifyInstance) => {
    const user = await fastify.mongo.db?.collection("user").findOne({});
    const userId = _get(user, "userId");
    return userId;
  },
  updateUserId: async (fastify: FastifyInstance, userId: string) => {
    fastify.mongo.db?.collection("user").updateOne(
      {},
      {
        $set: {
          userId: userId,
        },
      },
      { upsert: true }
    );
  },
  getPlaylistId: async (fastify: FastifyInstance) => {
    const playlist = await fastify.mongo.db?.collection("playlist").findOne({});
    const playlistId = _get(playlist, "playlistId");
    return playlistId;
  },
  updatePlaylistId: async (fastify: FastifyInstance, playlistId: string) => {
    fastify.mongo.db?.collection("playlist").updateOne(
      {},
      {
        $set: {
          playlistId: playlistId,
        },
      },
      { upsert: true }
    );
  },
};

export default utils;
