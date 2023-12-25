export type filterSearchType = {
  name: string;
  images: string;
  external_url: string;
  uri: string;
};

export type footerActionType = {
  nextUrl: string;
  limit: number;
  offset: number;
};

export const actionCommands = {
  ADD_TRACK: "ADD_TRACK",
  PERVIOUS_PAGE: "PERVIOUS_PAGE",
  NEXT_PAGE: "NEXT_PAGE",
};
