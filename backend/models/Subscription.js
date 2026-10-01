import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerPhone: { type: String, required: true },
        boxName: { type: String, required: true },
        boxSize: {
            type: String,
            enum: ['small', 'medium', 'large', 'family'],
            default: 'medium',
        },
        items: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            name: String,
            image: String,
            price: Number,
            quantity: { type: Number, default: 1 },
        }],
        boxPrice: { type: Number, required: true },
        frequency: {
            type: String,
            enum: ['weekly', 'biweekly', 'monthly'],
            default: 'weekly',
        },
        deliveryDay: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            default: 'wednesday',
        },
        shippingAddress: {
            line1: String,
            city: String,
            state: String,
            pincode: String,
        },
        startDate: Date,
        nextDelivery: Date,
        skippedCount: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['active', 'paused', 'cancelled'],
            default: 'active',
        },
    },
    { timestamps: true }
);

export default mongoose.model('Subscription', subscriptionSchema);
