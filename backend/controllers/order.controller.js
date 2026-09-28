import crypto from "crypto";
import mongoose from "mongoose";
import Template from "../models/Template.js";
import Order from "../models/Order.js";
import { buildEsewaFormParams } from "../utils/esewa.js";
import { isStoreCategoryEnabled } from "../utils/templateVisibility.js";

export const checkout = async (req, res) => {
  const { templateSlug } = req.body;
  const template = await Template.findOne({
    slug: templateSlug,
    isActive: true,
  }).select(Template.publicFields());
  if (!template || !(await isStoreCategoryEnabled(template.category))) {
    return res.status(404).json({ message: "Template not found" });
  }

  const alreadyOwned = await Order.hasAccess(req.user._id, template._id);
  if (alreadyOwned) {
    return res.status(400).json({ message: "You already own this template" });
  }

  const transactionUuid = crypto.randomUUID();
  await Order.create({
    user: req.user._id,
    template: template._id,
    amount: template.price,
    transactionUuid,
  });

  const apiBase = `${req.protocol}://${req.get("host")}`;
  const params = buildEsewaFormParams({
    amount: template.price,
    transactionUuid,
    successUrl: `${apiBase}/api/payment/esewa/success`,
    failureUrl: `${apiBase}/api/payment/esewa/failure`,
  });

  res.json({
    esewaUrl: `${process.env.ESEWA_BASE_URL}/api/epay/main/v2/form`,
    params,
  });
};

// Return a template's private customizer URL only for its paid order owner.
export const getOrderCustomizeLink = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.orderId)) {
    return res.status(404).json({ message: "Paid order not found" });
  }

  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user._id,
    status: "COMPLETE",
  }).populate({ path: "template", select: "+customizeUrl" });

  if (!order?.template?.customizeUrl) {
    return res
      .status(404)
      .json({
        message: "Customization link is not available for this paid order",
      });
  }

  res.json({ customizeUrl: order.template.customizeUrl });
};

export const myOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("template", "name slug coverImage")
    .sort("-createdAt");
  res.json({ orders });
};
