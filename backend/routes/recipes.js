import express from 'express';
import Recipe from '../models/Recipe.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { category, limit } = req.query;
    const filter = { published: true };
    if (category && category !== 'all') filter.category = category;
    let q = Recipe.find(filter).sort('-createdAt');
    if (limit) q = q.limit(Number(limit));
    res.json(await q.exec());
});

router.get('/:slug', async (req, res) => {
    const recipe = await Recipe.findOne({ slug: req.params.slug, published: true });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
});

router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const recipe = await Recipe.create(req.body);
        res.status(201).json(recipe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!recipe) return res.status(404).json({ message: 'Not found' });
    res.json(recipe);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
});

export default router;
