import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import templateRoutes from "./routes/template.routes.js";
import orderRoutes from "./routes/order.routes.js";
import esewaRoutes from "./routes/esewa.routes.js";
import { createCategoryRouter } from "./routes/categoryRoutes.js";
import { protect, adminOnly } from "./middleware/auth.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment/esewa", esewaRoutes);

app.use(
  "/api/categories",
  createCategoryRouter({
    authenticate: protect,
    requireAdmin: adminOnly,
  }),
);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// IMPORTANT: /private is NEVER served statically.
// Template files are only reachable through the authenticated download route.

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`LAYR API running on port ${PORT}`));
