import express from 'express';
import Order from '../models/Order.js';
import { protect, adminOnly, optional, staffRead, notDemo } from '../middleware/auth.js';
import { wrap, HttpError, isId } from '../lib/http.js';
import { quote, reserveStock, releaseStock, useCoupon } from '../lib/pricing.js';
import { resolveSlot } from '../lib/delivery.js';
import { maskOrder } from '../lib/privacy.js';

const router = express.Router();
const STATUSES = ['placed', 'packing', 'out-for-delivery', 'delivered', 'cancelled'];
const text = (v, max) => String(v ?? '').trim().slice(0, max);

// Price preview for checkout: the same server pricing the real order uses (also validates coupons).
router.post('/quote', wrap(async (req, res) => {
    const q = await quote(req.body.items, req.body.couponCode);
    res.json({ ...q, coupon: q.coupon && { code: q.coupon.code, description: q.coupon.description } });
}));

router.post('/', optional, notDemo, wrap(async (req, res) => {
    const b = req.body;
    const customerName = text(b.customerName, 80);
    const customerPhone = text(b.customerPhone, 20);
    const addr = b.shippingAddress || {};
    const shippingAddress = {
        line1: text(addr.line1, 160), line2: text(addr.line2, 160),
        city: text(addr.city, 60), state: text(addr.state, 60), pincode: text(addr.pincode, 6),
    };
    if (!customerName || customerPhone.replace(/\D/g, '').length < 10 || !shippingAddress.line1) {
        throw new HttpError(400, 'Please fill in your name, phone and address.');
    }
    const { city, slot } = resolveSlot(shippingAddress.pincode, b.deliverySlot);
    const q = await quote(b.items, b.couponCode);

    await reserveStock(q.items);
    try {
        await useCoupon(q.coupon);
        const order = await Order.create({
            user: req.user?._id,
            customerName, customerPhone,
            customerEmail: text(b.customerEmail, 120).toLowerCase(),
            shippingAddress: { ...shippingAddress, city: shippingAddress.city || city },
            items: q.items,
            subtotal: q.subtotal, discount: q.discount, couponCode: q.coupon?.code,
            shipping: q.shipping, tax: q.tax, total: q.total,
            paymentMethod: 'cod',
            deliverySlot: slot,
            notes: text(b.notes, 500),
        });
        res.status(201).json(order);
    } catch (err) {
        await releaseStock(q.items);
        throw err;
    }
}));

router.get('/my', protect, wrap(async (req, res) => {
    res.json(await Order.find({ user: req.user._id }).sort('-createdAt').lean());
}));

// Customers can cancel while the order has not been packed yet. Stock goes back on the shelf.
router.post('/:id/cancel', protect, wrap(async (req, res) => {
    if (!isId(req.params.id)) throw new HttpError(400, 'Invalid order.');
    const order = await Order.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id, status: 'placed' },
        { status: 'cancelled' },
        { new: true },
    );
    if (!order) throw new HttpError(400, 'This order can no longer be cancelled.');
    await releaseStock(order.items);
    res.json(order);
}));

router.get('/', protect, staffRead, wrap(async (req, res) => {
    const orders = await Order.find({}).sort('-createdAt').limit(300).lean();
    res.json(req.user.role === 'demo' ? orders.map(maskOrder) : orders);
}));

router.put('/:id/status', protect, adminOnly, wrap(async (req, res) => {
    const { status } = req.body;
    if (!isId(req.params.id) || !STATUSES.includes(status)) throw new HttpError(400, 'Invalid status.');
    // Cancelled is final, so stock is only ever returned once.
    const order = await Order.findOneAndUpdate(
        { _id: req.params.id, status: { $ne: 'cancelled' } },
        { status },
        { new: true },
    );
    if (!order) throw new HttpError(400, 'Cancelled orders cannot be changed.');
    if (status === 'cancelled') await releaseStock(order.items);
    res.json(order);
}));

export default router;
