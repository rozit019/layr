import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { uploadPreview } from "../middleware/upload.js";
import {
  listTemplates,
  getTemplate,
  myLibrary,
  createTemplate,
  updateTemplate,
  deactivateTemplate,
} from "../controllers/template.controller.js";

const router = express.Router();

// PUBLIC — only public fields; customizeUrl is never returned here.
router.get("/", listTemplates);
router.get("/me/library", protect, myLibrary);
router.get("/:slug", getTemplate);

// ADMIN — a screenshot is uploaded to Cloudinary; no ZIP is accepted.
router.post(
  "/",
  protect,
  adminOnly,
  uploadPreview.single("previewImage"),
  createTemplate,
);
router.put(
  "/:slug",
  protect,
  adminOnly,
  uploadPreview.single("previewImage"),
  updateTemplate,
);
router.delete("/:slug", protect, adminOnly, deactivateTemplate);

export default router;
