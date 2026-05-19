import express from 'express';
import Subscription from '../models/Subscription.js';
import { protect, adminOnly, optional } from '../middleware/auth.js';

const router = express.Router();

const computeNextDelivery = (deliveryDay, frequency) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(deliveryDay);
    if (targetDay < 0) return null;
    const now = new Date();
    const today = now.getDay();
    let daysUntil = (targetDay - today + 7) % 7;
    if (daysUntil === 0) daysUntil = 7;
    const next = new Date(now);
    next.setDate(now.getDate() + daysUntil);
    return next;
};

router.post('/', optional, async (req, res) => {
    try {
        const data = req.body;
        if (!data.customerName || !data.customerEmail || !data.items?.length) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const sub = await Subscription.create({
            ...data,
            user: req.user?._id,
            startDate: new Date(),
            nextDelivery: computeNextDelivery(data.deliveryDay || 'wednesday', data.frequency || 'weekly'),
        });
        res.status(201).json(sub);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/my', protect, async (req, res) => {
    res.json(await Subscription.find({ user: req.user._id }).sort('-createdAt'));
});

router.get('/', protect, adminOnly, async (req, res) => {
    const { status } = req.query;
    const filter = status ? { status } : {};
    res.json(await Subscription.find(filter).sort('-createdAt'));
});

router.put('/:id', protect, adminOnly, async (req, res) => {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sub) return res.status(404).json({ message: 'Not found' });
    res.json(sub);
});

export default router;
