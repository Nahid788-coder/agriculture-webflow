import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { wrap, HttpError } from '../lib/http.js';

const router = express.Router();

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Wishlist ids come with the user, so the app never needs a separate request for them.
export const sanitize = (u) => ({
    id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone,
    wishlist: (u.wishlist || []).map(String),
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', wrap(async (req, res) => {
    const name = String(req.body.name || '').trim().slice(0, 60);
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const phone = String(req.body.phone || '').trim().slice(0, 20);
    if (!name || !EMAIL.test(email)) throw new HttpError(400, 'Please enter your name and a valid email.');
    if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters.');
    if (await User.exists({ email })) throw new HttpError(400, 'That email is already registered. Try signing in.');
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({ token: sign(user), user: sanitize(user) });
}));

router.post('/login', wrap(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(String(req.body.password || '')))) {
        throw new HttpError(401, 'Wrong email or password.');
    }
    res.json({ token: sign(user), user: sanitize(user) });
}));

router.get('/me', protect, (req, res) => res.json({ user: sanitize(req.user) }));

export default router;
