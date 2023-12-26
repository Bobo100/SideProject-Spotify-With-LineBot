import {
  filterSearchType,
  footerActionType,
  actionCommands,
} from "../utils/lineType";
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
  generateMessageTemplate: () => {
    const message = {
      type: "flex",
      altText: "Your Spotify search result",
      contents: {
        type: "bubble",
        size: "giga",
        header: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "Powered by Spotify",
              color: "#ffffff",
              size: "xxs",
              align: "end",
              gravity: "center",
              position: "relative",
              weight: "regular",
            },
          ],
          paddingAll: "10px",
        },
        hero: {
          type: "image",
          url: "https://as2.ftcdn.net/v2/jpg/03/41/12/49/1000_F_341124942_vR2gEyR9kaELUfLRKbkC3qM7fwIfMSn7.jpg",
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [],
          spacing: "none",
        },
        footer: {
          type: "box",
          layout: "horizontal",
          contents: [],
        },
        styles: {
          header: {
            backgroundColor: "#1DB954",
          },
          body: {
            backgroundColor: "#191414",
          },
          footer: {
            backgroundColor: "#191414",
          },
        },
      },
    };
    return message;
  },
  generateFlexbox: (data: filterSearchType) => {
    return {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "image",
              aspectRatio: "4:3",
              aspectMode: "cover",
              url: data.images ? data.images : "",
            },
          ],
          flex: 0,
          cornerRadius: "5px",
          width: "20%",
          spacing: "none",
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              size: "md",
              color: "#1DB954",
              style: "normal",
              weight: "bold",
              text: data.name,
              wrap: true,
            },
            {
              type: "text",
              size: "xxs",
              wrap: true,
              color: "#FFFFFF",
              text: `author`,
              // text: this.generateArtistList(track),
            },
          ],
          spacing: "none",
          width: "30%",
          margin: "md",
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: utils.generateAddTrackPostbackButton("INSERT", {
                action: actionCommands.ADD_TRACK,
                uri: data.uri,
                position: "0",
              }),
              style: "primary",
              gravity: "bottom",
              color: "#1DB954",
              height: "sm",
            },
          ],
          spacing: "none",
          width: "20%",
          margin: "md",
          alignItems: "center",
          justifyContent: "center",
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: utils.generateAddTrackPostbackButton("APPEND", {
                action: actionCommands.ADD_TRACK,
                uri: data.uri,
                position: null,
              }),
              style: "primary",
              gravity: "bottom",
              color: "#1DB954",
              height: "sm",
            },
          ],
          spacing: "none",
          width: "20%",
          margin: "md",
          alignItems: "center",
          justifyContent: "center",
        },
      ],
      backgroundColor: "#191414",
      spacing: "none",
      cornerRadius: "5px",
    };
  },
  generateFooter: (data: footerActionType) => {
    const template = {
      type: "box",
      layout: "horizontal",
      contents: [],
      backgroundColor: "#191414",
      spacing: "xl",
      cornerRadius: "5px",
    };
    if (data.prevUrl) {
      template.contents.push({
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: utils.generateNextPagePostbackButton("上一頁", {
              action: actionCommands.PERVIOUS_PAGE,
              next: data.prevUrl,
            }),
            style: "primary",
            gravity: "bottom",
            color: "#1DB954",
            height: "sm",
          },
        ],
        spacing: "none",
        justifyContent: "center",
      } as never);
    }
    if (data.nextUrl) {
      template.contents.push({
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: utils.generateNextPagePostbackButton("下一頁", {
              action: actionCommands.NEXT_PAGE,
              next: data.nextUrl,
            }),
            style: "primary",
            gravity: "bottom",
            color: "#1DB954",
            height: "sm",
          },
        ],
        spacing: "none",
      } as never);
    }
    return;
  },
  /**
   * 產生postback button
   * @param title
   * @param payload
   * @returns
   * {
   *   "type": "postback",
   *   "label": "Buy",
   *   "data": "action=buy&itemid=111",
   *   "displayText": "Buy",
   *   "inputOption": "openKeyboard",
   *   "fillInText": "---\nName: \nPhone: \nBirthday: \n---"
   * }
   * payload: {
   *   action: actionCommands.ADD_TRACK,
   *   uri: data.uri,
   * }
   * 要轉換成action=actionCommands.ADD_TRACK&uri=data.uri
   */
  generateAddTrackPostbackButton: (
    title: string,
    payload: any
  ): { [key: string]: string } => {
    return {
      type: "postback",
      label: title,
      data: `action=${payload.action}&uri=${payload.uri}&position=${payload.position}`,
    };
  },
  generateNextPagePostbackButton: (
    title: string,
    payload: any
  ): { [key: string]: string } => {
    return {
      type: "postback",
      label: title,
      data: `action=${payload.action}&next=${payload.next}`,
    };
  },
};

export default utils;
