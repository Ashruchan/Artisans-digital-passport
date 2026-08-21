const TOKEN_KEY = "artisanToken";

export function getArtisanToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setArtisanToken(token) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearArtisanToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function passportPublicUrl(passportId) {
  if (typeof window === "undefined") return `/passport/${passportId}`;
  return `${window.location.origin}/passport/${passportId}`;
}

export function artisanPassportPath(passportId) {
  return `/artisan/passport/${passportId}`;
}

export function statusLabel(status) {
  if (status === "Checked") return "Checked";
  if (status === "Reported") return "Reported";
  return "Waiting";
}

export function statusColors(status) {
  if (status === "Checked") return { bg: "#3E5641", fg: "#FAF3E9" };
  if (status === "Reported") return { bg: "#A83E3E", fg: "#FAF3E9" };
  return { bg: "#D9A441", fg: "#2B2420" };
}

/** Read file as data URL, optionally downscale for upload. */
export function readImageAsDataUrl(file, maxWidth = 900) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read photo"));
    reader.onload = () => {
      const raw = reader.result;
      if (typeof raw !== "string") {
        reject(new Error("Could not read photo"));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(raw);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(raw);
      img.src = raw;
    };
    reader.readAsDataURL(file);
  });
}
