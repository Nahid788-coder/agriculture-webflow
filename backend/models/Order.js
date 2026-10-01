import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    unit: String,
    quantity: { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        customerName: { type: String, required: true },
        customerPhone: { type: String, required: true },
        customerEmail: String,
        shippingAddress: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            pincode: String,
        },
        items: [orderItemSchema],
        subtotal: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        couponCode: String,
        shipping: { type: Number, default: 49 },
        tax: Number,
        total: { type: Number, required: true },
        paymentMethod: {
            type: String,
            enum: ['cod', 'card', 'upi', 'netbanking'],
            default: 'cod',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        status: {
            type: String,
            enum: ['placed', 'packing', 'out-for-delivery', 'delivered', 'cancelled'],
            default: 'placed',
        },
        deliverySlot: {
            date: String, // YYYY-MM-DD (India time)
            window: String,
            label: String,
        },
        notes: { type: String, maxlength: 500 },
    },
    { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
