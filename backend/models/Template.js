import mongoose from "mongoose";

const STORE_CATEGORIES = ["portfolio", "birthday", "proposal", "anniversary"];

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: STORE_CATEGORIES,
      required: true,
      index: true,
    },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 }, // NPR
    // Do not include in public projections. Release it only through a paid-order route.
    customizeUrl: { type: String, required: true, select: false },
    coverImage: { type: String, required: true }, // Cloudinary secure_url; public storefront preview.
    coverImagePublicId: { type: String, select: false }, // Cloudinary asset ID for admin updates/removal.
    techStack: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

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

templateSchema.index({ isActive: 1, category: 1, createdAt: -1 });

export default mongoose.models.Template ||
  mongoose.model("Template", templateSchema);
