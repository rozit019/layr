import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    amount: { type: Number, required: true }, // NPR
    transactionUuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETE", "FAILED", "EXPIRED"],
      default: "PENDING",
    },
    esewaRefId: String,
  },
  { timestamps: true },
);

// A user owns a template if they have at least one COMPLETE order for it.
orderSchema.statics.hasAccess = async function (userId, templateId) {
  const order = await this.findOne({
    user: userId,
    template: templateId,
    status: "COMPLETE",
  });
  return !!order;
};

export default mongoose.model("Order", orderSchema);
