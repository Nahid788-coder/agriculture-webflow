import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDb } from './db.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import subscriptionRoutes from './routes/subscriptions.js';
import recipeRoutes from './routes/recipes.js';
import statsRoutes from './routes/stats.js';
import wishlistRoutes from './routes/wishlist.js';
import deliveryRoutes from './routes/delivery.js';
import couponRoutes from './routes/coupons.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

// On Vercel the site and the API share one origin; CLIENT_URL is only needed for other origins.
const allowed = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
    origin(origin, cb) {
        if (!origin || allowed.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
        cb(null, false);
    },
}));
app.use(helmet());
app.use(express.json({ limit: '100kb' }));

const limit = (max, minutes = 15) => rateLimit({ windowMs: minutes * 60_000, max, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many requests, please try again in a few minutes.' } });

app.get('/api/health', async (_req, res) => {
    let db = 'disconnected';
    try {
        await connectDb();
        db = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
    } catch {
        db = 'error';
    }
    res.json({ ok: db === 'connected', db });
});

app.use('/api', async (_req, res, next) => {
    try {
        await connectDb();
        next();
    } catch (err) {
        console.error('DB connection failed:', err.message);
        res.status(503).json({ message: 'The store is waking up. Please try again in a moment.' });
    }
});

app.use('/api/auth', limit(30), authRoutes);
app.use('/api/products', productRoutes);
const orderLimit = limit(40);
app.use('/api/orders', (req, res, next) => (req.method === 'POST' ? orderLimit(req, res, next) : next()), orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/delivery', limit(120), deliveryRoutes);
app.use('/api/coupons', couponRoutes);

app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    const status = err.status || (err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500);
    if (status >= 500) console.error(err);
    res.status(status).json({ message: status >= 500 ? 'Something went wrong. Please try again.' : err.message });
});

export default app;
