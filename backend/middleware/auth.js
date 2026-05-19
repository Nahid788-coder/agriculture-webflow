import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });
        req.user = user;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin')
        return res.status(403).json({ message: 'Admin access required' });
    next();
};

export const optional = async (req, _res, next) => {
    try {
        const header = req.headers.authorization;
        if (header?.startsWith('Bearer ')) {
            const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
        }
    } catch { /* */ }
    next();
};
