const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";
/** Turn backend/tech errors into short plain language for artisans. */
export function friendlyAuthError(err, fallback = "Something went wrong. Please try again.") {
  const raw = (err?.message || "").toLowerCase();
  const status = err?.status;

  if (
    status === 404 ||
    raw.includes("not registered") ||
    raw.includes("artisan not found") ||
    raw.includes("register first")
  ) {
    return "You are not registered yet. Please contact your cooperative.";
  }

  if (raw.includes("valid indian phone") || raw.includes("phone number is required")) {
    return "Please enter a valid 10-digit phone number.";
  }

  if (raw.includes("please wait") && raw.includes("seconds")) {
    return err.message;
  }

  if (raw.includes("expired")) {
    return "This OTP has expired. Please tap Resend OTP.";
  }

  if (raw.includes("too many incorrect") || raw.includes("too many")) {
    return "Too many wrong tries. Please tap Resend OTP.";
  }

  if (raw.includes("invalid otp")) {
    return "Wrong OTP. Please check and try again.";
  }

  if (raw.includes("no otp requested")) {
    return "Please request an OTP first.";
  }

  if (
    raw.includes("buffering timed out") ||
    raw.includes("econnrefused") ||
    raw.includes("failed to fetch") ||
    raw.includes("network") ||
    raw.includes("mongodb") ||
    raw.includes("timed out") ||
    status >= 500
  ) {
    return "Could not check your number right now. Please try again.";
  }

  if (
    raw.includes("operation `") ||
    raw.includes("findone") ||
    raw.includes("cast to") ||
    raw.includes("jwt")
  ) {
    return fallback;
  }

  return err?.message || fallback;
}

async function parseResponse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message || data?.error || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function apiGet(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });
  return parseResponse(res);
}

export async function apiPost(path, body, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(extraHeaders || {}),
    },
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

export async function apiPatch(path, body, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(extraHeaders || {}),
    },
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

export async function sendArtisanOtp(phone) {
  return apiPost("/auth/send-otp", { phone });
}

export async function verifyArtisanOtp(phone, otp) {
  return apiPost("/auth/verify-otp", { phone, otp });
}

export async function getArtisanMe(token) {
  return apiGet("/artisans/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getArtisanProducts(token) {
  return apiGet("/artisans/products", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getArtisanProduct(token, productId) {
  return apiGet(`/artisans/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createArtisanProduct(token, data) {
  return apiPost("/artisans/products", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function uploadPassportVideo(token, videoFile, posterFile) {
  const formData = new FormData();
  formData.append("video", videoFile);
  formData.append("poster", posterFile);

  const res = await fetch(`${API_BASE}/artisans/uploads/video`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  return parseResponse(res);
}

export async function getArtisanEarnings(token) {
  return apiGet("/artisans/earnings", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getPublicPassport(passportId) {
  return apiGet(`/passports/${passportId}`);
}

export async function reportPublicPassport(passportId) {
  return apiPost(`/passports/${passportId}/report`, {});
}

export async function registerCooperative(data) {
  return apiPost("/cooperatives/register", data);
}

export async function sendCooperativeOtp(phone) {
  return apiPost("/cooperatives/send-otp", { phone });
}

export async function verifyCooperativeOtp(phone, otp) {
  return apiPost("/cooperatives/verify-otp", { phone, otp });
}

export async function getCooperativeMe(token) {
  return apiGet("/cooperatives/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function registerArtisanByCooperative(token, data) {
  return apiPost("/cooperatives/artisan", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getCooperativeArtisans(token) {
  return apiGet("/cooperatives/artisans", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getCooperativeProducts(token) {
  return apiGet("/cooperatives/products", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createProductByCooperative(token, data) {
  return apiPost("/cooperatives/products", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function verifyProductStatus(token, productId, status) {
  return apiPatch(`/cooperatives/products/${productId}/verify`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getPayoutTransparency(token) {
  return apiGet("/cooperatives/transparency", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
