import express from 'express';
import { protect } from '../middleware/auth.js';
import { signup, login, me, logout } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, me);
router.post('/logout', logout);

export default router;
