const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsRoot = path.join(__dirname, "../uploads");
const videosDir = path.join(uploadsRoot, "videos");
const postersDir = path.join(uploadsRoot, "posters");

for (const dir of [videosDir, postersDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "video") {
      cb(null, videosDir);
      return;
    }
    if (file.fieldname === "poster") {
      cb(null, postersDir);
      return;
    }
    cb(new Error("Unexpected upload field"));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt =
      ext ||
      (file.mimetype === "video/webm"
        ? ".webm"
        : file.mimetype === "video/quicktime"
          ? ".mov"
          : ".mp4");
    cb(null, `${crypto.randomBytes(16).toString("hex")}${safeExt}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.fieldname === "video") {
    if (VIDEO_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Video must be MP4 or WebM format"));
    return;
  }

  if (file.fieldname === "poster") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Poster must be an image"));
    return;
  }

  cb(new Error("Unexpected upload field"));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const uploadPassportMedia = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "poster", maxCount: 1 },
]);

module.exports = {
  uploadPassportMedia,
  uploadsRoot,
};
