import express from 'express';
import { checkPincode } from '../lib/delivery.js';

const router = express.Router();

router.get('/check', (req, res) => {
    res.json(checkPincode(req.query.pincode));
});

export default router;
