import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect, adminOnly, staffRead } from '../middleware/auth.js';
import { wrap, HttpError, isId } from '../lib/http.js';

const router = express.Router();

// Public: active offers to show at checkout.
router.get('/active', wrap(async (_req, res) => {
    const now = new Date();
    const list = await Coupon.find({ active: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] })
        .select('code description minOrder')
        .sort('minOrder')
        .lean();
    res.set('Cache-Control', 'public, s-maxage=300');
    res.json(list);
}));

router.get('/', protect, staffRead, wrap(async (_req, res) => {
    res.json(await Coupon.find({}).sort('-createdAt').lean());
}));

const FIELDS = ['code', 'description', 'type', 'value', 'minOrder', 'maxDiscount', 'expiresAt', 'usageLimit', 'active'];
const pick = (b) => Object.fromEntries(FIELDS.filter((k) => k in b && b[k] !== '').map((k) => [k, b[k]]));

router.post('/', protect, adminOnly, wrap(async (req, res) => {
    const data = pick(req.body);
    if (!/^[A-Z0-9]{3,20}$/i.test(data.code || '')) throw new HttpError(400, 'Code: 3–20 letters or numbers.');
    if (await Coupon.exists({ code: data.code.toUpperCase() })) throw new HttpError(400, 'That code already exists.');
    res.status(201).json(await Coupon.create(data));
}));

router.put('/:id', protect, adminOnly, wrap(async (req, res) => {
    if (!isId(req.params.id)) throw new HttpError(400, 'Invalid coupon.');
    const { code: _ignored, ...rest } = pick(req.body);
    const c = await Coupon.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true });
    if (!c) throw new HttpError(404, 'Not found');
    res.json(c);
}));

export default router;
