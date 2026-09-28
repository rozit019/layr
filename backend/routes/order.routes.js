import express from "express";
import { protect } from "../middleware/auth.js";
import {
  checkout,
  getOrderCustomizeLink,
  myOrders,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/checkout", protect, checkout);
router.get("/mine", protect, myOrders);
router.get("/:orderId/customize-link", protect, getOrderCustomizeLink);

export default router;
