import express from 'express';
import { protect } from '../middleware/auth.js';
import { checkout, myOrders } from '../controllers/order.controller.js';

const router = express.Router();

router.post('/checkout', protect, checkout);
router.get('/mine', protect, myOrders);

export default router;
