import multer from "multer";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const uploadPreview = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: 10 * 1024 * 1024, // 10 MB; adjust if needed.
  },
  fileFilter(_req, file, callback) {
    if (!allowedImageTypes.has(file.mimetype)) {
      const error = new Error("Preview screenshot must be JPEG, PNG, or WebP.");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
});
