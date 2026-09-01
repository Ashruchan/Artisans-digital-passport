export const VIDEO_MAX_DURATION_SEC = 15;
export const VIDEO_MAX_SIZE_MB = 10;

export function validateVideoFile(file) {
  if (!file) {
    throw new Error("No file selected");
  }

  if (!file.type.startsWith("video/")) {
    throw new Error("Please choose a video file");
  }

  const maxBytes = VIDEO_MAX_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`Video must be under ${VIDEO_MAX_SIZE_MB}MB`);
  }
}

export function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      resolve(duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video"));
    };

    video.src = url;
  });
}

/** Grab a JPEG poster frame from the video for fast list/thumbnail loading. */
export async function extractVideoPoster(file, seekSec = 0.5) {
  const url = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve;
      video.onerror = () => reject(new Error("Could not read video"));
      video.src = url;
    });

    const seekTo = Math.min(
      seekSec,
      Number.isFinite(video.duration) ? video.duration * 0.1 : seekSec
    );
    video.currentTime = seekTo;

    await new Promise((resolve, reject) => {
      video.onseeked = resolve;
      video.onerror = () => reject(new Error("Could not read video frame"));
    });

    const maxWidth = 900;
    const scale = Math.min(1, maxWidth / (video.videoWidth || maxWidth));
    const w = Math.max(1, Math.round((video.videoWidth || maxWidth) * scale));
    const h = Math.max(1, Math.round((video.videoHeight || maxWidth) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create poster");
    }

    ctx.drawImage(video, 0, 0, w, h);

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.82);
    });

    if (!blob) {
      throw new Error("Could not create poster");
    }

    return new File([blob], "poster.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}
