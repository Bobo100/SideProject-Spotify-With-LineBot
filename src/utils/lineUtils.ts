const LINE_HEADER = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + process.env.LINE_CHANNEL_ACCESS_TOEKN,
};

const utils = {
  replayMessage: async (replyToken: string, message: any) => {
    try {
      await fetch(`${process.env.LINE_MESSAGING_API}/reply`, {
        method: "POST",
        headers: LINE_HEADER,
        body: JSON.stringify({
          replyToken: replyToken,
          messages: [message],
        }),
      });
    } catch (error) {
      console.error(`Delivery to LINE failed (${error})`);
    }
  },
};

export default utils;
