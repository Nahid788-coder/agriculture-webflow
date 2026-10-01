import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { protect, staffRead } from '../middleware/auth.js';
import { wrap } from '../lib/http.js';

const router = express.Router();
export const LOW_STOCK = 10;

router.get('/', protect, staffRead, wrap(async (_req, res) => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [revenue, orders, monthOrders, products, lowStock, activeSubs, subscriptions, users] = await Promise.all([
        Order.aggregate([{ $match: { status: 'delivered' } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: monthStart } }),
        Product.countDocuments(),
        Product.find({ stock: { $lte: LOW_STOCK } }).select('name stock unit').sort('stock').lean(),
        Subscription.countDocuments({ status: 'active' }),
        Subscription.countDocuments(),
        User.countDocuments({ role: 'user' }),
    ]);

    res.json({
        totals: {
            revenue: Math.round(revenue[0]?.sum || 0), orders, monthOrders, products,
            activeSubs, subscriptions, users,
        },
        lowStock,
    });
}));

export default router;
