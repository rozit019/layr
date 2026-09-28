import express from "express";
import CategorySetting, {
  STORE_CATEGORIES,
} from "../models/CategorySetting.js";

const CATEGORY_DETAILS = [
  { key: "portfolio", label: "Portfolios", title: "Portfolio sites" },
  { key: "birthday", label: "Birthday wishes", title: "Birthday pages" },
  { key: "proposal", label: "Proposals", title: "Proposal pages" },
  { key: "anniversary", label: "Anniversaries", title: "Anniversary pages" },
];

export function createCategoryRouter({ authenticate, requireAdmin }) {
  if (
    typeof authenticate !== "function" ||
    typeof requireAdmin !== "function"
  ) {
    throw new TypeError(
      "createCategoryRouter requires authentication and admin middleware.",
    );
  }

  const router = express.Router();

  router.get("/", async (_req, res, next) => {
    try {
      const records = await CategorySetting.find({
        key: { $in: STORE_CATEGORIES },
      })
        .select("key isEnabled")
        .lean();
      const saved = new Map(
        records.map((record) => [record.key, record.isEnabled]),
      );
      res.json({
        categories: CATEGORY_DETAILS.map((item) => ({
          ...item,
          isEnabled: saved.get(item.key) ?? true,
        })),
      });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:key", authenticate, requireAdmin, async (req, res, next) => {
    try {
      const { key } = req.params;
      if (!STORE_CATEGORIES.includes(key)) {
        return res
          .status(400)
          .json({ message: "Unknown storefront category." });
      }
      if (typeof req.body?.isEnabled !== "boolean") {
        return res
          .status(400)
          .json({ message: "isEnabled must be true or false." });
      }

      const setting = await CategorySetting.findOneAndUpdate(
        { key },
        {
          $set: {
            isEnabled: req.body.isEnabled,
            updatedBy: req.user?._id || req.user?.id || null,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      ).select("key isEnabled updatedAt");

      res.json({
        category: {
          key: setting.key,
          isEnabled: setting.isEnabled,
          updatedAt: setting.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
