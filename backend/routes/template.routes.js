import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { uploadTemplate } from '../middleware/upload.js';
import {
  listTemplates,
  getTemplate,
  downloadTemplate,
  myLibrary,
  createTemplate,
  updateTemplate,
  deactivateTemplate
} from '../controllers/template.controller.js';

const router = express.Router();

// PUBLIC — list/detail return only public fields (no file path/URL)
router.get('/', listTemplates);
router.get('/me/library', protect, myLibrary);
router.get('/:slug', getTemplate);

// CUSTOMER — streams from private dir, gated by COMPLETE order
router.get('/:slug/download', protect, downloadTemplate);

// ADMIN
router.post('/', protect, adminOnly, uploadTemplate.single('file'), createTemplate);
router.put('/:slug', protect, adminOnly, updateTemplate);
router.delete('/:slug', protect, adminOnly, deactivateTemplate);

export default router;
