import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, lowercase: true, index: true },
        shortDescription: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        unit: { type: String, default: 'kg' },
        category: {
            type: String,
            enum: ['vegetables', 'fruits', 'grains', 'dairy', 'pantry', 'beverages', 'bakery'],
            required: true,
            index: true,
        },
        images: [{ type: String, required: true }],
        farm: { type: String, default: 'Harvest Co. Farms' },
        origin: { type: String, default: 'Maharashtra' },
        certifications: [String],
        nutrition: {
            calories: Number,
            protein: Number,
            carbs: Number,
            fat: Number,
            fiber: Number,
        },
        season: String,
        stock: { type: Number, default: 50, min: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 }, // average of customer reviews
        reviewCount: { type: Number, default: 0 },
        organic: { type: Boolean, default: true },
        featured: { type: Boolean, default: false },
        subscriptionEligible: { type: Boolean, default: true },
        tags: [String],
    },
    { timestamps: true }
);

productSchema.pre('validate', function () {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
});

export default mongoose.model('Product', productSchema);
