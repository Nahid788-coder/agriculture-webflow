import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import subscriptionRoutes from './routes/subscriptions.js';
import recipeRoutes from './routes/recipes.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/', (_req, res) => {
    res.json({
        name: 'Harvest Co. API',
        version: '1.0.0',
        status: 'running',
        endpoints: ['/api/auth', '/api/products', '/api/orders', '/api/subscriptions', '/api/recipes', '/api/stats'],
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✓ MongoDB connected');
        app.listen(PORT, () => console.log(`✓ Harvest API running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('✗ MongoDB connection failed:', err.message);
        process.exit(1);
    });
