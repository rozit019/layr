import multer from "multer";
import path from "path";

// Multer writes uploads to a PRIVATE folder (never served by express.static)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "private/templates"),
  filename: (req, file, cb) =>
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`,
    ),
});

export const uploadTemplate = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB zip
});
