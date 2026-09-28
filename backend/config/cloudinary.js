import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function assertCloudinaryConfigured() {
  const missing = [
    ["CLOUDINARY_CLOUD_NAME", process.env.CLOUDINARY_CLOUD_NAME],
    ["CLOUDINARY_API_KEY", process.env.CLOUDINARY_API_KEY],
    ["CLOUDINARY_API_SECRET", process.env.CLOUDINARY_API_SECRET],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    const error = new Error(
      `Cloudinary is not configured. Set: ${missing.join(", ")}`,
    );
    error.status = 503;
    throw error;
  }
}

export default cloudinary;
