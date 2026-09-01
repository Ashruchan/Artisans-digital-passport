/** Handle passport video + poster upload. Files stay on disk; MongoDB stores URLs only. */
const uploadPassportVideo = (req, res, next) => {
  try {
    const videoFile = req.files?.video?.[0];
    if (!videoFile) {
      res.status(400);
      throw new Error("Video file is required");
    }

    const posterFile = req.files?.poster?.[0];
    const videoUrl = `/uploads/videos/${videoFile.filename}`;
    const posterUrl = posterFile
      ? `/uploads/posters/${posterFile.filename}`
      : "";

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
