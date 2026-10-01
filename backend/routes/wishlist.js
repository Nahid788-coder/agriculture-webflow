import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect, notDemo } from '../middleware/auth.js';
import { wrap, HttpError, isId } from '../lib/http.js';

const router = express.Router();

router.get('/', protect, wrap(async (req, res) => {
    res.json(await Product.find({ _id: { $in: req.user.wishlist } }).lean());
}));

// Toggle a product; returns the updated list of ids.
router.post('/:productId', protect, notDemo, wrap(async (req, res) => {
    const id = req.params.productId;
    if (!isId(id) || !(await Product.exists({ _id: id }))) throw new HttpError(404, 'Product not found');
    const has = req.user.wishlist.some((w) => String(w) === id);
    await User.updateOne({ _id: req.user._id }, has ? { $pull: { wishlist: id } } : { $addToSet: { wishlist: id } });
    const { wishlist } = await User.findById(req.user._id).select('wishlist').lean();
    res.json({ wishlist: wishlist.map(String), added: !has });
}));

export default router;
