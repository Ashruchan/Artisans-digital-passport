const COOPERATIVE_TOKEN_KEY = "karigar_cooperative_token";

export function getCooperativeToken() {
  return localStorage.getItem(COOPERATIVE_TOKEN_KEY);
}

export function setCooperativeToken(token) {
  localStorage.setItem(COOPERATIVE_TOKEN_KEY, token);
}

export function clearCooperativeToken() {
  localStorage.removeItem(COOPERATIVE_TOKEN_KEY);
}