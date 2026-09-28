import path from "path";
import fs from "fs";
import Template from "../models/Template.js";
import Order from "../models/Order.js";

// ── PUBLIC ─────────────────────────────────────────────────────────────

export const listTemplates = async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  const templates = await Template.find(filter).select(Template.publicFields());
  res.json({ templates });
};

export const getTemplate = async (req, res) => {
  const template = await Template.findOne({
    slug: req.params.slug,
    isActive: true,
  }).select(Template.publicFields());
  if (!template) return res.status(404).json({ message: "Template not found" });
  res.json({ template });
};

// ── CUSTOMER ───────────────────────────────────────────────────────────

// Streams the file from the PRIVATE dir. The real disk path is never exposed.
export const downloadTemplate = async (req, res) => {
  const template = await Template.findOne({
    slug: req.params.slug,
    isActive: true,
  });
  if (!template) return res.status(404).json({ message: "Template not found" });

  const hasAccess = await Order.hasAccess(req.user._id, template._id);
  if (!hasAccess) {
    return res
      .status(403)
      .json({ message: "Purchase required to download this template" });
  }

  const absPath = path.resolve(template.filePath);
  if (!absPath.startsWith(path.resolve("private")) || !fs.existsSync(absPath)) {
    return res.status(404).json({ message: "File missing on server" });
  }

  res.download(absPath, template.fileName);
};

export const myLibrary = async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    status: "COMPLETE",
  }).populate("template", "name slug category coverImage techStack");
  res.json({ templates: orders.map((o) => o.template) });
};

// ── ADMIN ──────────────────────────────────────────────────────────────

export const createTemplate = async (req, res) => {
  const { name, slug, category, description, price, techStack, coverImage } =
    req.body;
  if (!req.file)
    return res.status(400).json({ message: "Template file (zip) is required" });

  const template = await Template.create({
    name,
    slug,
    category,
    description,
    price: Number(price),
    techStack,
    coverImage,
    filePath: req.file.path, // private — never sent to clients
    fileName: req.file.originalname,
  });
  const publicTemplate = await Template.findById(template._id).select(
    Template.publicFields(),
  );
  res.status(201).json({ template: publicTemplate });
};

export const updateTemplate = async (req, res) => {
  const template = await Template.findOneAndUpdate(
    { slug: req.params.slug },
    req.body,
    { new: true },
  ).select(Template.publicFields());
  if (!template) return res.status(404).json({ message: "Template not found" });
  res.json({ template });
};

export const deactivateTemplate = async (req, res) => {
  await Template.findOneAndUpdate(
    { slug: req.params.slug },
    { isActive: false },
  );
  res.json({ message: "Template deactivated" });
};
