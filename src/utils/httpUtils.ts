import _get from "lodash/get";
import _isEqual from "lodash/isEqual";
import mongoDbUtils from "./mongoDbUtils";

interface HttpFetchPostProps {
  url: string;
  headers?: any;
  body?: any;
}

interface HttpFetchPostPropsWithToken extends HttpFetchPostProps {
  fastify: any;
}

interface HttpFetchGetProps {
  url: string;
  headers?: any;
  body?: any;
}

interface HttpFetchGetPropsWithToken extends HttpFetchGetProps {
  fastify: any;
}

const utils = {
  httpFetchPostWithToken: async (props: HttpFetchPostPropsWithToken) => {
    const { url, headers = {}, body = {}, fastify } = props;
    const { access_token } = await mongoDbUtils.getTokens(fastify);
    const spotifyResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...headers,
      },
      body: body,
    });
    const data = await spotifyResponse.json();
    const errorStatus = _get(data, "error.status");
    if (_isEqual(errorStatus, 401)) {
      await fetch(process.env.BASE_URL + "/refresh", {
        method: "GET",
      });
      await utils.httpFetchPostWithToken(props);
    } else if (errorStatus) {
      return data;
    } else {
      return data;
    }
  },
  httpFetchPost: async (props: HttpFetchPostProps) => {
    const { url, headers = {}, body = {} } = props;
    const spotifyResponse = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });
    const data = await spotifyResponse.json();
    const errorStatus = _get(data, "error.status");
    if (_isEqual(errorStatus, 401)) {
      await fetch(process.env.BASE_URL + "/refresh", {
        method: "GET",
      });
      await utils.httpFetchPost(props);
    } else if (errorStatus) {
      return data;
    } else {
      return data;
    }
  },
  httpFetchGetWithToken: async (props: HttpFetchGetPropsWithToken) => {
    const { url, headers = {}, fastify } = props;
    const { access_token } = await mongoDbUtils.getTokens(fastify);
    const spotifyResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...headers,
      },
    });
    const data = await spotifyResponse.json();
    const errorStatus = _get(data, "error.status");
    if (_isEqual(errorStatus, 401)) {
      await fetch(process.env.BASE_URL + "/refresh", {
        method: "GET",
      });
      await utils.httpFetchGetWithToken(props);
    } else if (errorStatus) {
      return data;
    } else {
      return data;
    }
  },
  httpFetchGet: async (props: HttpFetchGetProps) => {
    const { url, headers = {} } = props;
    const spotifyResponse = await fetch(url, {
      method: "GET",
      headers: headers,
    });
    const data = await spotifyResponse.json();
    const errorStatus = _get(data, "error.status");
    if (_isEqual(errorStatus, 401)) {
      await fetch(process.env.BASE_URL + "/refresh", {
        method: "GET",
      });
      await utils.httpFetchGet(props);
    } else if (errorStatus) {
      return data;
    } else {
      return data;
    }
  },
};
export default utils;