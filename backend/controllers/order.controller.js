import crypto from 'crypto';
import Template from '../models/Template.js';
import Order from '../models/Order.js';
import { buildEsewaFormParams } from '../utils/esewa.js';

export const checkout = async (req, res) => {
  const { templateSlug } = req.body;
  const template = await Template.findOne({ slug: templateSlug, isActive: true })
    .select(Template.publicFields());
  if (!template) return res.status(404).json({ message: 'Template not found' });

  const alreadyOwned = await Order.hasAccess(req.user._id, template._id);
  if (alreadyOwned) return res.status(400).json({ message: 'You already own this template' });

  const transactionUuid = crypto.randomUUID();
  await Order.create({
    user: req.user._id,
    template: template._id,
    amount: template.price,
    transactionUuid
  });

  const apiBase = `${req.protocol}://${req.get('host')}`;
  const params = buildEsewaFormParams({
    amount: template.price,
    transactionUuid,
    successUrl: `${apiBase}/api/payment/esewa/success`,
    failureUrl: `${apiBase}/api/payment/esewa/failure`
  });

  // Client does an auto-submitting POST form to the eSewa gateway.
  res.json({
    esewaUrl: `${process.env.ESEWA_BASE_URL}/api/epay/main/v2/form`,
    params
  });
};

export const myOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('template', 'name slug coverImage')
    .sort('-createdAt');
  res.json({ orders });
};
