import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, async (_req, res) => {
    try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [orders, products, subs, users, recipes] = await Promise.all([
            Order.find({}).sort('-createdAt').lean(),
            Product.countDocuments(),
            Subscription.find({}).lean(),
            User.countDocuments({ role: 'user' }),
            Recipe.countDocuments(),
        ]);

        const delivered = orders.filter((o) => o.status === 'delivered');
        const totalRevenue = delivered.reduce((s, o) => s + (o.total || 0), 0);
        const monthOrders = orders.filter((o) => new Date(o.createdAt) >= monthStart);
        const activeSubs = subs.filter((s) => s.status === 'active').length;

        res.json({
            totals: {
                revenue: Math.round(totalRevenue),
                orders: orders.length,
                monthOrders: monthOrders.length,
                products,
                subscriptions: subs.length,
                activeSubs,
                users,
                recipes,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
