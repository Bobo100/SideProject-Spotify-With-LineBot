// auth.ts
let access_token: string | null = null;
let refresh_token: string | null = null;

export const token_type = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
};

export function setToken(token: string, type: string) {
  if (type ===  token_type.accessToken) {
    access_token = token;
  } else {
    refresh_token = token;
  }
}

export function getToken(type: string) {
  if (type === token_type.accessToken) {
    return access_token;
  } else {
    return refresh_token;
  }
}

let codeVerifer: string | null = null;

export function setCodeVerifer(code: string) {
  codeVerifer = code;
}

export function getCodeVerifer() {
  return codeVerifer;
}
