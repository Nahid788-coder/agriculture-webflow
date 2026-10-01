import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6, select: false },
        phone: String,
        role: { type: String, enum: ['user', 'admin', 'demo'], default: 'user' },
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        addresses: [{
            label: String,
            line1: String,
            line2: String,
            city: String,
            state: String,
            pincode: String,
        }],
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (entered) {
    return bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);
