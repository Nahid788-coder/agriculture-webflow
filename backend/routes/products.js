import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { protect, adminOnly, notDemo } from '../middleware/auth.js';
import { wrap, HttpError, isId } from '../lib/http.js';
import { shortName } from '../lib/privacy.js';

const router = express.Router();

// The catalog is small, so the app loads it once and filters/sorts in the browser.
router.get('/', wrap(async (_req, res) => {
    const products = await Product.find({}).sort('-featured -createdAt').lean();
    // Not cached on the CDN: stock changes with every order and must show up immediately.
    res.set('Cache-Control', 'no-store');
    res.json(products);
}));

// Product page: product, related items and reviews in one response.
router.get('/:slug', wrap(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug }).lean();
    if (!product) throw new HttpError(404, 'Product not found');
    const [related, reviews] = await Promise.all([
        Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4).lean(),
        Review.find({ product: product._id }).sort('-createdAt').limit(30).lean(),
    ]);
    res.json({
        product,
        related,
        reviews: reviews.map((r) => ({
            _id: r._id, user: String(r.user), name: shortName(r.name), rating: r.rating,
            comment: r.comment, verified: r.verified, createdAt: r.createdAt,
        })),
    });
}));

async function refreshRating(productId) {
    // Reviews per product are few, so averaging here is simple and works on any MongoDB.
    const list = await Review.find({ product: productId }).select('rating').lean();
    const reviewCount = list.length;
    const rating = reviewCount ? Math.round((list.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10 : 0;
    await Product.updateOne({ _id: productId }, { rating, reviewCount });
    return { rating, reviewCount };
}

// Add or edit your review. "Verified" when you have bought the product.
router.post('/:id/reviews', protect, notDemo, wrap(async (req, res) => {
    if (!isId(req.params.id)) throw new HttpError(400, 'Invalid product.');
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim().slice(0, 600);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, 'Please choose 1 to 5 stars.');
    const product = await Product.findById(req.params.id).select('_id').lean();
    if (!product) throw new HttpError(404, 'Product not found');

    const verified = Boolean(await Order.exists({ user: req.user._id, 'items.product': product._id, status: { $ne: 'cancelled' } }));
    const review = await Review.findOneAndUpdate(
        { product: product._id, user: req.user._id },
        { rating, comment, verified, name: req.user.name },
        { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    const summary = await refreshRating(product._id);
    res.status(201).json({
        review: { _id: review._id, user: String(review.user), name: shortName(review.name), rating, comment, verified, createdAt: review.createdAt },
        ...summary,
    });
}));

router.delete('/:id/reviews', protect, wrap(async (req, res) => {
    if (!isId(req.params.id)) throw new HttpError(400, 'Invalid product.');
    await Review.deleteOne({ product: req.params.id, user: req.user._id });
    res.json(await refreshRating(new mongoose.Types.ObjectId(req.params.id)));
}));

/* ---------- Admin ---------- */

const FIELDS = ['name', 'shortDescription', 'description', 'price', 'unit', 'category', 'images', 'farm', 'origin',
    'certifications', 'season', 'stock', 'organic', 'featured', 'subscriptionEligible', 'tags'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));

router.post('/', protect, adminOnly, wrap(async (req, res) => {
    res.status(201).json(await Product.create(pick(req.body)));
}));

router.put('/:id', protect, adminOnly, wrap(async (req, res) => {
    if (!isId(req.params.id)) throw new HttpError(400, 'Invalid product.');
    const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!product) throw new HttpError(404, 'Not found');
    res.json(product);
}));

router.delete('/:id', protect, adminOnly, wrap(async (req, res) => {
    if (!isId(req.params.id)) throw new HttpError(400, 'Invalid product.');
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new HttpError(404, 'Not found');
    await Review.deleteMany({ product: product._id });
    res.json({ message: 'Deleted' });
}));

export default router;
