import Product from '../models/Product.js';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';

// Public, read-only account shown on the login page so visitors can explore the admin console.
export const DEMO = { email: 'demo@harvestco.farm', password: 'demo-view-only' };

export const products = [
    { name: 'Heirloom Tomatoes', shortDescription: 'Sun-ripened, vine-fresh, full of flavour.', description: 'Hand-picked heirloom tomatoes from our Pune-region partner farm. Multiple varieties for colour and complexity. Sweet, acidic, and never refrigerated before reaching you.', price: 220, unit: 'kg', category: 'vegetables', images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&q=85&auto=format&fit=crop','https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=900&q=85&auto=format&fit=crop'], farm: 'Sahyadri Organic Farms', origin: 'Pune, Maharashtra', certifications: ['India Organic', 'PGS-Organic'], season: 'Year-round', stock: 80, featured: true, tags: ['salad', 'cooking'] },
    { name: 'Wild Mountain Honey', shortDescription: 'Single-origin, raw, unfiltered.', description: 'Harvested twice a year from forest hives in Uttarakhand. Naturally crystallizes — that\'s how you know it is real. Notes of wildflower, eucalyptus, and warm stone.', price: 690, unit: '500g jar', category: 'pantry', images: ['https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=900&q=85&auto=format&fit=crop'], farm: 'Himalayan Wild Hives', origin: 'Uttarakhand', certifications: ['Wild Forest', 'Lab-Tested Pure'], stock: 35, featured: true, tags: ['honey', 'gift'] },
    { name: 'Hass Avocados', shortDescription: 'Buttery, ripe, ready to eat.', description: 'Premium Hass variety from our Coorg estate. Slow-ripened in coffee fields, hand-graded for ripeness, and shipped within 36 hours of picking.', price: 380, unit: '4-pack', category: 'fruits', images: ['https://images.unsplash.com/photo-1601039641847-7857b994d704?w=900&q=85&auto=format&fit=crop'], farm: 'Coorg Estate', origin: 'Karnataka', stock: 45, featured: true, tags: ['fruit', 'breakfast'] },
    { name: 'Stone-Ground Atta', shortDescription: 'Whole wheat, milled fresh on order.', description: 'Sharbati wheat, stone-milled within 48 hours of dispatch. Higher fibre, deeper flavour, and a softer roti than supermarket flour. Sealed in compostable packaging.', price: 180, unit: '5kg', category: 'grains', images: ['https://images.unsplash.com/photo-1568376794508-ae52c6ab3929?w=900&q=85&auto=format&fit=crop'], farm: 'Madhya Pradesh Co-op', origin: 'Madhya Pradesh', certifications: ['India Organic'], stock: 60, tags: ['flour', 'staple'] },
    { name: 'A2 Cow Ghee', shortDescription: 'Bilona-churned, golden, cultured.', description: 'Made the traditional way: cultured curd, churned by hand, slow-clarified. From a small herd of Gir cows in our Gujarat partner farm. The golden standard.', price: 1290, unit: '500ml', category: 'dairy', images: ['https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=900&q=85&auto=format&fit=crop'], farm: 'Gir Heritage Farms', origin: 'Gujarat', certifications: ['A2 Verified', 'India Organic'], stock: 25, featured: true, tags: ['ghee', 'dairy'] },
    { name: 'Cold-Pressed Olive Oil', shortDescription: 'First press, low-acid, intensely fruity.', description: 'Single-estate Picual olives from the Rajasthan-based estate Olive India. Cold-pressed within hours of harvest. Acidity below 0.4%.', price: 880, unit: '500ml', category: 'pantry', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=900&q=85&auto=format&fit=crop'], origin: 'Rajasthan', stock: 30, tags: ['oil', 'gift'] },
    { name: 'Heirloom Apples', shortDescription: 'Crisp, tart, Himachal-grown.', description: 'Royal Delicious and Granny Smith blend from small family orchards in Himachal. No wax, no polish — just freshness and bite.', price: 320, unit: 'kg', category: 'fruits', images: ['https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=900&q=85&auto=format&fit=crop'], origin: 'Himachal Pradesh', stock: 70, season: 'Sep–Mar', tags: ['fruit'] },
    { name: 'Fresh Spinach Bunch', shortDescription: 'Tender leaves, picked this morning.', description: 'Living-soil grown spinach from our Lonavla farm. Triple-washed, never bagged in plastic. Best within 4 days of delivery.', price: 60, unit: 'bunch', category: 'vegetables', images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=900&q=85&auto=format&fit=crop'], origin: 'Lonavla', stock: 100, tags: ['greens'] },
    { name: 'Sourdough Loaf', shortDescription: 'Wild-yeast, 36-hour fermentation.', description: 'Baked fresh in our Pune kitchen each morning. Stone-ground flour, sea salt, water, time. Naturally vegan, naturally extraordinary.', price: 240, unit: '500g loaf', category: 'bakery', images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=85&auto=format&fit=crop'], origin: 'Pune', stock: 20, featured: true, tags: ['bread'] },
    { name: 'Cold-Brew Coffee', shortDescription: '14-hour steeped, single-origin.', description: 'Chikmagalur peaberry beans, coarse-ground, slow-steeped overnight. Smooth, low-acid, and ready to drink. Glass bottle, returnable.', price: 240, unit: '500ml bottle', category: 'beverages', images: ['https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=900&q=85&auto=format&fit=crop'], origin: 'Karnataka', stock: 40, tags: ['coffee'] },
    { name: 'Organic Brown Rice', shortDescription: 'Short-grain, nutty, slow-grown.', description: 'Pesticide-free, grown using SRI methods in Kerala backwaters. The grain that gave us our standards.', price: 165, unit: '5kg', category: 'grains', images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=85&auto=format&fit=crop'], origin: 'Kerala', certifications: ['India Organic'], stock: 55, tags: ['rice', 'staple'] },
    { name: 'Kombucha — Ginger Lemon', shortDescription: 'Fermented, fizzy, alive.', description: 'Brewed in small batches with green tea, raw ginger, and Coorg lemons. Naturally probiotic, naturally bright.', price: 220, unit: '750ml bottle', category: 'beverages', images: ['https://images.unsplash.com/photo-1556881286-fc6915169721?w=900&q=85&auto=format&fit=crop'], origin: 'Bengaluru', stock: 38, tags: ['drink', 'probiotic'] },
];

export const recipes = [
    { title: 'Roasted Heirloom Tomato Galette', excerpt: 'A rustic open-faced tart that lets summer tomatoes do the heavy lifting.', coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=85&auto=format&fit=crop', category: 'lunch', cookTime: 60, servings: 4, difficulty: 'medium', ingredients: ['1 kg Heirloom Tomatoes', '200g cold butter', '300g flour', 'Sea salt', 'Cracked pepper', 'Sourdough crumbs', '1 egg yolk'], steps: ['Make the pâte brisée by rubbing butter into flour. Rest 30m.', 'Slice tomatoes thick. Salt and drain on paper.', 'Roll out dough, top with crumbs, layer tomatoes.', 'Fold edges, brush with egg yolk.', 'Bake 200°C for 35 minutes.'], author: 'Harvest Kitchen' },
    { title: 'Honey-Roasted Carrots', excerpt: 'Five ingredients. Twenty minutes. Side dish hall-of-famer.', coverImage: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=1200&q=85&auto=format&fit=crop', category: 'dinner', cookTime: 25, servings: 4, difficulty: 'easy', ingredients: ['500g rainbow carrots', '3 tbsp Wild Mountain Honey', '2 tbsp olive oil', 'Sea salt', 'Thyme'], steps: ['Halve carrots lengthwise.', 'Toss with honey, olive oil, salt, thyme.', 'Roast at 220°C for 18-22 minutes until caramelised.'], author: 'Harvest Kitchen' },
    { title: 'Avocado Toast, Reimagined', excerpt: 'No basic toast — this one earns its place at brunch.', coverImage: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&q=85&auto=format&fit=crop', category: 'breakfast', cookTime: 10, servings: 2, difficulty: 'easy', ingredients: ['1 ripe Hass avocado', '2 slices Sourdough', 'Lime', 'Maldon salt', 'Aleppo pepper', 'Soft-boiled egg', 'Microgreens'], steps: ['Toast sourdough until golden.', 'Mash avocado with lime and Maldon.', 'Spread thickly. Top with egg and microgreens.', 'Finish with Aleppo pepper.'], author: 'Harvest Kitchen' },
    { title: 'Cold-Brew Affogato', excerpt: 'Indian summer\'s answer to dessert.', coverImage: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=1200&q=85&auto=format&fit=crop', category: 'dessert', cookTime: 5, servings: 2, difficulty: 'easy', ingredients: ['200ml Cold-Brew Coffee', '4 scoops vanilla bean ice cream', '20g dark chocolate', 'Sea salt'], steps: ['Place 2 scoops ice cream in each glass.', 'Pour 100ml cold brew over each.', 'Grate chocolate on top, finish with sea salt.'], author: 'Harvest Kitchen' },
];

export const coupons = [
    { code: 'FRESH10', description: '10% off, up to ₹150', type: 'percent', value: 10, maxDiscount: 150, minOrder: 499 },
    { code: 'HARVEST100', description: '₹100 off orders above ₹999', type: 'flat', value: 100, minOrder: 999 },
    { code: 'FIRSTBASKET', description: '15% off your first basket, up to ₹250', type: 'percent', value: 15, maxDiscount: 250, minOrder: 699, usageLimit: 500 },
];

/**
 * Makes a fresh database usable with no manual steps (Vercel has no shell):
 * sample products, recipes and coupons, the admin from ADMIN_EMAIL/ADMIN_PASSWORD,
 * and the read-only demo account.
 */
export async function ensureSeed({ resetCatalog = false } = {}) {
    if (resetCatalog) {
        await Promise.all([Product.deleteMany({}), Recipe.deleteMany({})]);
    }
    const [productCount, recipeCount, couponCount] = await Promise.all([
        Product.estimatedDocumentCount(),
        Recipe.estimatedDocumentCount(),
        Coupon.estimatedDocumentCount(),
    ]);
    // create() one by one so the slug hook runs.
    if (!productCount) for (const p of products) await Product.create(p);
    if (!recipeCount) for (const r of recipes) await Recipe.create(r);
    if (!couponCount) await Coupon.insertMany(coupons);

    await syncAdmin();
    await syncRatings();

    if (!(await User.exists({ email: DEMO.email }))) {
        await User.create({ name: 'Demo Admin', email: DEMO.email, password: DEMO.password, role: 'demo' });
    }
}

/**
 * The admin account is defined only by ADMIN_EMAIL / ADMIN_PASSWORD (Vercel env vars):
 * its password always matches the env value, and any other admin account (for example the
 * old public admin@harvestco.farm / admin123 from the first version) loses admin rights.
 */
const LEGACY_ADMIN = 'admin@harvestco.farm';

async function syncAdmin() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    // The first version printed this login publicly; it must never be an admin unless set in the env.
    if (email !== LEGACY_ADMIN) await User.updateOne({ email: LEGACY_ADMIN, role: 'admin' }, { role: 'user' });
    if (!email || !password) return;

    const demoted = await User.updateMany({ role: 'admin', email: { $ne: email } }, { role: 'user' });
    if (demoted.modifiedCount) console.log(`Removed admin rights from ${demoted.modifiedCount} old account(s)`);

    const admin = await User.findOne({ email }).select('+password');
    if (!admin) {
        await User.create({ name: 'Admin', email, password, role: 'admin' });
        console.log(`Admin created: ${email}`);
    } else if (admin.role !== 'admin' || !(await admin.matchPassword(password))) {
        admin.role = 'admin';
        admin.password = password; // hashed by the model's save hook
        await admin.save();
        console.log(`Admin updated: ${email}`);
    }
}

/** Ratings come only from real reviews; clears any sample numbers left in an older database. */
async function syncRatings() {
    const [products, reviews] = await Promise.all([
        Product.find({}).select('rating reviewCount').lean(),
        Review.find({}).select('product rating').lean(),
    ]);
    const byProduct = new Map();
    for (const r of reviews) {
        const k = String(r.product);
        const e = byProduct.get(k) || { sum: 0, n: 0 };
        e.sum += r.rating;
        e.n += 1;
        byProduct.set(k, e);
    }
    const fixes = [];
    for (const p of products) {
        const e = byProduct.get(String(p._id));
        const reviewCount = e?.n || 0;
        const rating = e ? Math.round((e.sum / e.n) * 10) / 10 : 0;
        if (p.reviewCount !== reviewCount || p.rating !== rating) {
            fixes.push(Product.updateOne({ _id: p._id }, { rating, reviewCount }));
        }
    }
    if (fixes.length) {
        await Promise.all(fixes);
        console.log(`Ratings corrected on ${fixes.length} product(s)`);
    }
}
