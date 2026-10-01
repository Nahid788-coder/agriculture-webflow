import express from 'express';
import Recipe from '../models/Recipe.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Loaded once by the app and filtered in the browser.
router.get('/', async (_req, res) => {
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.json(await Recipe.find({ published: true }).sort('-createdAt').lean());
});

const FIELDS = ['title', 'excerpt', 'coverImage', 'category', 'cookTime', 'servings', 'difficulty', 'ingredients', 'steps', 'author', 'published'];
const pick = (b) => Object.fromEntries(FIELDS.filter((k) => k in b).map((k) => [k, b[k]]));

router.get('/:slug', async (req, res) => {
    const recipe = await Recipe.findOne({ slug: req.params.slug, published: true });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
});

router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const recipe = await Recipe.create(pick(req.body));
        res.status(201).json(recipe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!recipe) return res.status(404).json({ message: 'Not found' });
    res.json(recipe);
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
});

export default router;
