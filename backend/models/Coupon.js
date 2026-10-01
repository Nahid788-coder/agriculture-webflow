import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        description: { type: String, default: '' },
        type: { type: String, enum: ['percent', 'flat'], required: true },
        value: { type: Number, required: true, min: 1 },
        minOrder: { type: Number, default: 0, min: 0 },
        maxDiscount: { type: Number, min: 0 },
        expiresAt: Date,
        usageLimit: { type: Number, min: 1 },
        used: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
