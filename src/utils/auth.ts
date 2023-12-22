// auth.ts
let codeVerifer: string | null = null;

export function setCodeVerifer(code: string) {
  codeVerifer = code;
}

export function getCodeVerifer() {
  return codeVerifer;
}
