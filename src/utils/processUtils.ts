import _get from "lodash/get";
import { FastifyReply } from "fastify";
import { AnyARecord } from "dns";
const utils = {
  filterSearch: (data: any) => {
    // 我們要處理的資料
    // data.items 會是一個array
    // 然後我們要歷遍這個array 再取出它裡面的albumn中的images array中的最後一個url
    const result = data.tracks.items.map((item: any) => {
      return {
        name: item.name,
        images: item.album.images[item.album.images.length - 1].url,
        external_url: item.external_urls.spotify,
        uri: item.uri,
      };
    });
    const nextUrl = data.tracks.next;
    const limit = data.tracks.limit;
    const offset = data.tracks.offset;
    const total = data.tracks.total;
    return {
      result,
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
