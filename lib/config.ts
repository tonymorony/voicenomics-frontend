export const API_BASE: string =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
  "http://127.0.0.1:8080";

export const MARKETPLACE_REFRESH_MS: number =
  (typeof process !== "undefined" && Number(process.env.NEXT_PUBLIC_MARKETPLACE_REFRESH_MS)) ||
  20000;


