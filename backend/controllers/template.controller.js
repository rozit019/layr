import Template from "../models/Template.js";
import { STORE_CATEGORIES } from "../models/CategorySetting.js";
import Order from "../models/Order.js";
import {
  enabledStoreCategoryKeys,
  isStoreCategoryEnabled,
} from "../utils/templateVisibility.js";
import {
  deletePreviewImage,
  uploadPreviewImage,
} from "../utils/cloudinaryUpload.js";

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// PUBLIC: the projection intentionally never includes customizeUrl.
export const listTemplates = async (req, res) => {
  const enabledCategories = await enabledStoreCategoryKeys();
  const filter = { isActive: true, category: { $in: enabledCategories } };

  if (req.query.category) {
    if (!STORE_CATEGORIES.includes(req.query.category)) {
      return res.status(400).json({ message: "Unknown template category." });
    }
    filter.category = req.query.category;
  }

  const templates = await Template.find(filter)
    .select(Template.publicFields())
    .sort("-createdAt");
  res.json({ templates });
};

// PUBLIC: do not return the private customization URL.
export const getTemplate = async (req, res) => {
  const template = await Template.findOne({
    slug: req.params.slug,
    isActive: true,
  }).select(Template.publicFields());
  if (!template || !(await isStoreCategoryEnabled(template.category))) {
    return res.status(404).json({ message: "Template not found" });
  }
  res.json({ template });
};

// CUSTOMER: only completed purchases are included, so only buyers receive the URL.
export const myLibrary = async (req, res) => {
  const orders = await Order.find({ user: req.user._id, status: "COMPLETE" })
    .populate({
      path: "template",
      select:
        "name slug category description price coverImage techStack +customizeUrl",
    })
    .sort("-createdAt");

  const uniqueTemplates = new Map();
  for (const order of orders) {
    if (order.template)
      uniqueTemplates.set(String(order.template._id), order.template);
  }
  res.json({ templates: [...uniqueTemplates.values()] });
};

// ADMIN: upload only a storefront screenshot to Cloudinary; no ZIP is used.
export const createTemplate = async (req, res) => {
  const { name, slug, category, description, price, techStack, customizeUrl } =
    req.body;
  if (!req.file?.buffer) {
    return res
      .status(400)
      .json({ message: "Website screenshot (previewImage) is required" });
  }
  if (!STORE_CATEGORIES.includes(category)) {
    return res
      .status(400)
      .json({ message: "Choose a valid storefront category." });
  }
  if (!customizeUrl || !isHttpUrl(customizeUrl)) {
    return res
      .status(400)
      .json({
        message: "A valid HTTP or HTTPS customization URL is required.",
      });
  }

  const image = await uploadPreviewImage(req.file.buffer);
  try {
    const template = await Template.create({
      name,
      slug,
      category,
      description,
      price: Number(price),
      techStack,
      customizeUrl,
      coverImage: image.secureUrl,
      coverImagePublicId: image.publicId,
    });
    const publicTemplate = await Template.findById(template._id).select(
      Template.publicFields(),
    );
    res.status(201).json({ template: publicTemplate });
  } catch (error) {
    await deletePreviewImage(image.publicId).catch(() => {});
    throw error;
  }
};

// ADMIN: edit listing fields, the private URL, and optionally replace the screenshot.
export const updateTemplate = async (req, res) => {
  const template = await Template.findOne({ slug: req.params.slug }).select(
    "+customizeUrl +coverImagePublicId",
  );
  if (!template) return res.status(404).json({ message: "Template not found" });

  const allowedFields = [
    "name",
    "slug",
    "category",
    "description",
    "price",
    "techStack",
    "customizeUrl",
    "isActive",
  ];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (updates.category && !STORE_CATEGORIES.includes(updates.category)) {
    return res
      .status(400)
      .json({ message: "Choose a valid storefront category." });
  }
  if (updates.customizeUrl && !isHttpUrl(updates.customizeUrl)) {
    return res
      .status(400)
      .json({ message: "Customization URL must start with HTTP or HTTPS." });
  }
  if (updates.price !== undefined) updates.price = Number(updates.price);

  const oldImagePublicId = template.coverImagePublicId;
  let newImage;
  if (req.file?.buffer) {
    newImage = await uploadPreviewImage(req.file.buffer);
    updates.coverImage = newImage.secureUrl;
    updates.coverImagePublicId = newImage.publicId;
  }

  try {
    await template.set(updates).save();
    const publicTemplate = await Template.findById(template._id).select(
      Template.publicFields(),
    );
    res.json({ template: publicTemplate });
    if (newImage && oldImagePublicId) {
      await deletePreviewImage(oldImagePublicId).catch(() => {});
    }
  } catch (error) {
    if (newImage) await deletePreviewImage(newImage.publicId).catch(() => {});
    throw error;
  }
};

export const deactivateTemplate = async (req, res) => {
  const template = await Template.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: { isActive: false } },
    { new: true },
  ).select("slug");
  if (!template) return res.status(404).json({ message: "Template not found" });
  res.json({ message: "Template deactivated" });
};
