import { filterSearchType, actionCommands } from "../utils/lineType";
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
  generateMessageTemplate: async () => {
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
              type: "image",
              url: "https://as2.ftcdn.net/v2/jpg/03/41/12/49/1000_F_341124942_vR2gEyR9kaELUfLRKbkC3qM7fwIfMSn7.jpg",
              align: "start",
              size: "xxs",
              flex: 0,
              aspectRatio: "4:3",
            },
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
        body: {
          type: "box",
          layout: "vertical",
          contents: [],
        },
        styles: {
          header: {
            backgroundColor: "#1DB954",
          },
          body: {
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
          width: "30%",
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
          width: "40%",
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: utils.generatePostbackButton("INSERT", {
                action: actionCommands.ADD_TRACK,
                uri: data.uri,
              }),
              style: "primary",
              gravity: "bottom",
              color: "#1DB954",
            },
          ],
          spacing: "none",
          width: "20%",
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: utils.generatePostbackButton("APPEND", {
                action: actionCommands.ADD_TRACK,
                uri: data.uri,
              }),
              style: "primary",
              gravity: "bottom",
              color: "#1DB954",
            },
          ],
          spacing: "none",
          width: "20%",
        },
      ],
      backgroundColor: "#191414",
      spacing: "xl",
      cornerRadius: "5px",
    };
  },
  generatePostbackButton: (title: string, payload: any) => {
    /*
    {
      "type": "postback",
      "label": "Buy",
      "data": "action=buy&itemid=111",
      "displayText": "Buy",
      "inputOption": "openKeyboard",
      "fillInText": "---\nName: \nPhone: \nBirthday: \n---"
    }
    payload: {
      action: actionCommands.ADD_TRACK,
      uri: data.uri,
    }         
    // 要轉換成action=actionCommands.ADD_TRACK&uri=data.uri
    */
    return {
      type: "postback",
      label: title,
      data: `action=${payload.action}&uri=${payload.uri}`,
    };
  },
};

export default utils;
