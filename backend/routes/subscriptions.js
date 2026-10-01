import express from 'express';
import Subscription from '../models/Subscription.js';
import { protect, adminOnly, staffRead, notDemo } from '../middleware/auth.js';
import { wrap, HttpError, isId } from '../lib/http.js';
import { priceBox, FREQUENCIES } from '../lib/pricing.js';
import { addInterval, nextWeekday, checkPincode } from '../lib/delivery.js';
import { maskSubscription } from '../lib/privacy.js';

const router = express.Router();
const ACTIONS = ['pause', 'resume', 'skip', 'cancel'];
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const text = (v, max) => String(v ?? '').trim().slice(0, max);

router.post('/', protect, notDemo, wrap(async (req, res) => {
    const b = req.body;
    const frequency = FREQUENCIES.includes(b.frequency) ? b.frequency : 'weekly';
    const deliveryDay = DAYS.includes(b.deliveryDay) ? b.deliveryDay : 'wednesday';
    const pin = checkPincode(b.pincode);
    if (!pin.ok) throw new HttpError(400, pin.message);
    const { items, boxPrice, box } = await priceBox(b.items, b.boxSize);

    const sub = await Subscription.create({
        user: req.user._id,
        customerName: req.user.name,
        customerEmail: req.user.email,
        customerPhone: text(b.phone || req.user.phone, 20) || '—',
        boxName: `${box.label} ${frequency[0].toUpperCase()}${frequency.slice(1)} Box`,
        boxSize: b.boxSize,
        items, boxPrice, frequency, deliveryDay,
        shippingAddress: { line1: text(b.address, 160), city: pin.city, pincode: pin.pincode },
        startDate: new Date(),
        nextDelivery: nextWeekday(deliveryDay),
    });
    res.status(201).json(sub);
}));

router.get('/my', protect, wrap(async (req, res) => {
    res.json(await Subscription.find({ user: req.user._id }).sort('-createdAt').lean());
}));

// Pause, resume, skip the next box, or cancel. Only the owner can do this.
router.post('/:id/:action', protect, wrap(async (req, res) => {
    if (!isId(req.params.id) || !ACTIONS.includes(req.params.action)) throw new HttpError(400, 'Invalid request.');
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
    if (!sub) throw new HttpError(404, 'Subscription not found.');
    if (sub.status === 'cancelled') throw new HttpError(400, 'This subscription is cancelled.');

    const action = req.params.action;
    if (action === 'pause') {
        if (sub.status !== 'active') throw new HttpError(400, 'Only an active subscription can be paused.');
        sub.status = 'paused';
    } else if (action === 'resume') {
        if (sub.status !== 'paused') throw new HttpError(400, 'This subscription is not paused.');
        sub.status = 'active';
        sub.nextDelivery = nextWeekday(sub.deliveryDay);
    } else if (action === 'skip') {
        if (sub.status !== 'active') throw new HttpError(400, 'Only an active subscription can skip a box.');
        sub.nextDelivery = addInterval(sub.nextDelivery || nextWeekday(sub.deliveryDay), sub.frequency);
        sub.skippedCount += 1;
    } else {
        sub.status = 'cancelled';
        sub.nextDelivery = undefined;
    }
    await sub.save();
    res.json(sub);
}));

router.get('/', protect, staffRead, wrap(async (req, res) => {
    const subs = await Subscription.find({}).sort('-createdAt').limit(300).lean();
    res.json(req.user.role === 'demo' ? subs.map(maskSubscription) : subs);
}));

router.put('/:id/status', protect, adminOnly, wrap(async (req, res) => {
    const { status } = req.body;
    if (!isId(req.params.id) || !['active', 'paused', 'cancelled'].includes(status)) throw new HttpError(400, 'Invalid status.');
    const sub = await Subscription.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!sub) throw new HttpError(404, 'Not found');
    res.json(sub);
}));

export default router;
