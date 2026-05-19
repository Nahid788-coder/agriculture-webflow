import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, lowercase: true, index: true },
        excerpt: { type: String, required: true },
        coverImage: { type: String, required: true },
        category: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'],
            default: 'lunch',
        },
        cookTime: Number,
        servings: { type: Number, default: 4 },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'easy',
        },
        ingredients: [String],
        steps: [String],
        author: { type: String, default: 'Harvest Kitchen' },
        published: { type: Boolean, default: true },
    },
    { timestamps: true }
);

recipeSchema.pre('validate', function () {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
});

export default mongoose.model('Recipe', recipeSchema);
