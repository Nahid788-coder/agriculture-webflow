import express from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { category, featured, subscribable, limit, search, sort } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (subscribable === 'true') filter.subscriptionEligible = true;
    if (search) {
        filter.$or = [
            { name: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { tags: new RegExp(search, 'i') },
        ];
    }

    let q = Product.find(filter);
    switch (sort) {
        case 'price-asc': q = q.sort('price'); break;
        case 'price-desc': q = q.sort('-price'); break;
        case 'rating': q = q.sort('-rating'); break;
        case 'newest': q = q.sort('-createdAt'); break;
        default: q = q.sort('-featured -createdAt');
    }
    if (limit) q = q.limit(Number(limit));
    res.json(await q.exec());
});

router.get('/:slug', async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const related = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
    }).limit(4);
    res.json({ product, related });
});

router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
});

export default router;
