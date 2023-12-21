// auth.ts
export const token_type = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
};

let codeVerifer: string | null = null;

export function setCodeVerifer(code: string) {
  codeVerifer = code;
}

export function getCodeVerifer() {
  return codeVerifer;
}
