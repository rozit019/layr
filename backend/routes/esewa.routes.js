import express from 'express';
import { paymentSuccess, paymentFailure } from '../controllers/esewa.controller.js';

const router = express.Router();

router.get('/success', paymentSuccess);
router.get('/failure', paymentFailure);

export default router;
