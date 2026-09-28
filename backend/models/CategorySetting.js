import mongoose from "mongoose";

export const STORE_CATEGORIES = [
  "portfolio",
  "birthday",
  "proposal",
  "anniversary",
];

const categorySettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: STORE_CATEGORIES,
      lowercase: true,
      trim: true,
    },
    isEnabled: { type: Boolean, default: true, required: true },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.models.CategorySetting ||
  mongoose.model("CategorySetting", categorySettingSchema);
