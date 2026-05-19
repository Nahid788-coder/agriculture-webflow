import express from 'express';
import Order from '../models/Order.js';
import { protect, adminOnly, optional } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optional, async (req, res) => {
    try {
        const data = req.body;
        if (!data.customerName || !data.customerPhone || !data.shippingAddress?.line1 || !data.items?.length) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const subtotal = data.items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
        const shipping = subtotal >= 999 ? 0 : 49;
        const tax = +(subtotal * 0.05).toFixed(2);
        const total = +(subtotal + shipping + tax).toFixed(2);

        const order = await Order.create({
            ...data,
            user: req.user?._id,
            subtotal, shipping, tax, total,
        });
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/my', protect, async (req, res) => {
    res.json(await Order.find({ user: req.user._id }).sort('-createdAt'));
});

router.get('/track/:id', async (req, res) => {
    const order = await Order.findById(req.params.id).select('-customerEmail');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
});

router.get('/', protect, adminOnly, async (req, res) => {
    const { status } = req.query;
    const filter = status ? { status } : {};
    res.json(await Order.find(filter).sort('-createdAt'));
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
});

export default router;
