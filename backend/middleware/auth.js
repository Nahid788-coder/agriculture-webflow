import jwt from 'jsonwebtoken';
import User from '../models/User.js';

async function userFromToken(req) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return null;
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    return User.findById(decoded.id);
}

export const protect = async (req, res, next) => {
    try {
        req.user = await userFromToken(req);
        if (!req.user) return res.status(401).json({ message: 'Please sign in.' });
        next();
    } catch {
        res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
};

/** Attaches req.user when a valid token is sent, but never blocks guests. */
export const optional = async (req, _res, next) => {
    try {
        req.user = await userFromToken(req);
    } catch {
        req.user = null;
    }
    next();
};

export const adminOnly = (req, res, next) => {
    if (req.user?.role === 'demo') return res.status(403).json({ message: 'The demo admin is read-only.' });
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
    next();
};

/** Admins plus the read-only demo account. Use only on GET routes. */
export const staffRead = (req, res, next) => {
    if (req.method !== 'GET' || !['admin', 'demo'].includes(req.user?.role)) {
        return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
};

/** Shoppers only: the demo account cannot place orders, review or subscribe. */
export const notDemo = (req, res, next) => {
    if (req.user?.role === 'demo') return res.status(403).json({ message: 'The demo admin is read-only.' });
    next();
};
