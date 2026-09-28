import cloudinary, {
  assertCloudinaryConfigured,
} from "../config/cloudinary.js";

export function uploadPreviewImage(buffer) {
  assertCloudinaryConfigured();
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return Promise.reject(
      Object.assign(new Error("Preview screenshot is empty."), { status: 400 }),
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "layr/template-covers",
        resource_type: "image",
        transformation: [
          {
            width: 1600,
            height: 1200,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url || !result?.public_id) {
          return reject(
            new Error("Cloudinary did not return a screenshot URL."),
          );
        }
        resolve({ secureUrl: result.secure_url, publicId: result.public_id });
      },
    );
    uploadStream.end(buffer);
  });
}

export async function deletePreviewImage(publicId) {
  if (!publicId) return;
  assertCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
