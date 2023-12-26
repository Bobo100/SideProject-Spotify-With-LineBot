import _get from "lodash/get";
import { FastifyReply } from "fastify";
const utils = {
  filterSearch: (data: any) => {
    const result = data.tracks.items.map((item: any) => {
      return {
        name: item.name,
        images: item.album.images[item.album.images.length - 2].url,
        external_url: item.external_urls.spotify,
        uri: item.uri,
      };
    });
    const prevUrl = data.tracks.previous;
    const nextUrl = data.tracks.next;
    const limit = data.tracks.limit;
    const offset = data.tracks.offset;
    const total = data.tracks.total;
    return {
      result,
      prevUrl,
      nextUrl,
      limit,
      offset,
      total,
    };
  },
  processResponseAndReturn: async (responseData: any, reply: FastifyReply) => {
    const errorStatus = _get(responseData, "error.status");
    if (errorStatus) {
      reply.code(errorStatus).send(responseData);
    } else {
      reply.code(200).send(responseData);
    }
  },
};

export default utils;
