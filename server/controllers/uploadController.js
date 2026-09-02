const fs = require("fs");
const cloudinary = require("../config/cloudinary");

/** Handle passport video + poster upload. Uploads to Cloudinary if credentials exist, else saves to disk. */
const uploadPassportVideo = async (req, res, next) => {
  try {
    const videoFile = req.files?.video?.[0];
    if (!videoFile) {
      res.status(400);
      throw new Error("Video file is required");
    }

    const posterFile = req.files?.poster?.[0];

    let videoUrl = `/uploads/videos/${videoFile.filename}`;
    let posterUrl = posterFile ? `/uploads/posters/${posterFile.filename}` : "";

    const hasCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      try {
        const videoResult = await cloudinary.uploader.upload(videoFile.path, {
          resource_type: "video",
          folder: "artisans_passport/videos",
        });
        videoUrl = videoResult.secure_url;

        if (fs.existsSync(videoFile.path)) {
          fs.unlinkSync(videoFile.path);
        }

        if (posterFile) {
          const posterResult = await cloudinary.uploader.upload(posterFile.path, {
            resource_type: "image",
            folder: "artisans_passport/posters",
          });
          posterUrl = posterResult.secure_url;

          if (fs.existsSync(posterFile.path)) {
            fs.unlinkSync(posterFile.path);
          }
        }
      } catch (cloudErr) {
        console.error("Cloudinary upload error:", cloudErr);
      }
    }

    res.json({
      success: true,
      videoUrl,
      posterUrl,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadPassportVideo };
