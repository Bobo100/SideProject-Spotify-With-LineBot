import _get from "lodash/get";
import { app } from "../../api/serverless";
const utils = {
  getTokens: async () => {
    const token = await app.mongo.db?.collection("token").findOne({});
    const access_token = _get(token, "access_token");
    const refresh_token = _get(token, "refresh_token");
    return {
      access_token,
      refresh_token,
    };
  },
  updateTokens: async (tokens: any) => {
    app.mongo.db?.collection("token").updateOne(
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
  getUserId: async () => {
    const user = await app.mongo.db?.collection("user").findOne({});
    const userId = _get(user, "userId");
    return userId;
  },
  updateUserId: async (userId: string) => {
    app.mongo.db?.collection("user").updateOne(
      {},
      {
        $set: {
          userId: userId,
        },
      },
      { upsert: true }
    );
  },
  getPlaylistId: async () => {
    const playlist = await app.mongo.db?.collection("playlist").findOne({});
    const playlistId = _get(playlist, "playlistId");
    return playlistId;
  },
  updatePlaylistId: async (playlistId: string) => {
    app.mongo.db?.collection("playlist").updateOne(
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
