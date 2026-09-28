import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ["landing-page", "portfolio", "online-store", "dashboard"],
      required: true,
    },
    description: String,
    price: { type: Number, required: true, min: 0 }, // in NPR
    // IMPORTANT: filePath is the PRIVATE disk path. It is NEVER sent to the client.
    filePath: { type: String, required: true },
    fileName: { type: String, required: true }, // original filename for download
    coverImage: String, // public preview image is fine
    techStack: String, // e.g. "HTML / CSS"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Public-safe projection: everything except the private file location.
templateSchema.statics.publicFields = function () {
  return {
    name: 1,
    slug: 1,
    category: 1,
    description: 1,
    price: 1,
    coverImage: 1,
    techStack: 1,
    createdAt: 1,
  };
};

export default mongoose.model("Template", templateSchema);
