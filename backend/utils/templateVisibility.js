import CategorySetting, { STORE_CATEGORIES } from './CategorySetting.js';

export async function isStoreCategoryEnabled(categoryKey) {
  if (!STORE_CATEGORIES.includes(categoryKey)) return false;
  const setting = await CategorySetting.findOne({ key: categoryKey }).select('isEnabled').lean();
  // Missing settings mean enabled, matching the public GET /api/categories defaults.
  return setting?.isEnabled !== false;
}

export async function enabledStoreCategoryKeys() {
  const disabled = await CategorySetting.find({ isEnabled: false, key: { $in: STORE_CATEGORIES } }).distinct('key');
  return STORE_CATEGORIES.filter((key) => !disabled.includes(key));
}
