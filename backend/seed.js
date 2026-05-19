import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Recipe from './models/Recipe.js';
import User from './models/User.js';

dotenv.config();

const products = [
    { name: 'Heirloom Tomatoes', shortDescription: 'Sun-ripened, vine-fresh, full of flavour.', description: 'Hand-picked heirloom tomatoes from our Pune-region partner farm. Multiple varieties for colour and complexity. Sweet, acidic, and never refrigerated before reaching you.', price: 220, unit: 'kg', category: 'vegetables', images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=900&q=85&auto=format&fit=crop','https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=900&q=85&auto=format&fit=crop'], farm: 'Sahyadri Organic Farms', origin: 'Pune, Maharashtra', certifications: ['India Organic', 'PGS-Organic'], season: 'Year-round', stock: 80, rating: 4.8, reviewCount: 142, featured: true, tags: ['salad', 'cooking'] },
    { name: 'Wild Mountain Honey', shortDescription: 'Single-origin, raw, unfiltered.', description: 'Harvested twice a year from forest hives in Uttarakhand. Naturally crystallizes — that\'s how you know it is real. Notes of wildflower, eucalyptus, and warm stone.', price: 690, unit: '500g jar', category: 'pantry', images: ['https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=900&q=85&auto=format&fit=crop'], farm: 'Himalayan Wild Hives', origin: 'Uttarakhand', certifications: ['Wild Forest', 'Lab-Tested Pure'], stock: 35, rating: 4.9, reviewCount: 87, featured: true, tags: ['honey', 'gift'] },
    { name: 'Hass Avocados', shortDescription: 'Buttery, ripe, ready to eat.', description: 'Premium Hass variety from our Coorg estate. Slow-ripened in coffee fields, hand-graded for ripeness, and shipped within 36 hours of picking.', price: 380, unit: '4-pack', category: 'fruits', images: ['https://images.unsplash.com/photo-1601039641847-7857b994d704?w=900&q=85&auto=format&fit=crop'], farm: 'Coorg Estate', origin: 'Karnataka', stock: 45, rating: 4.7, reviewCount: 56, featured: true, tags: ['fruit', 'breakfast'] },
    { name: 'Stone-Ground Atta', shortDescription: 'Whole wheat, milled fresh on order.', description: 'Sharbati wheat, stone-milled within 48 hours of dispatch. Higher fibre, deeper flavour, and a softer roti than supermarket flour. Sealed in compostable packaging.', price: 180, unit: '5kg', category: 'grains', images: ['https://images.unsplash.com/photo-1568376794508-ae52c6ab3929?w=900&q=85&auto=format&fit=crop'], farm: 'Madhya Pradesh Co-op', origin: 'Madhya Pradesh', certifications: ['India Organic'], stock: 60, rating: 4.6, reviewCount: 98, tags: ['flour', 'staple'] },
    { name: 'A2 Cow Ghee', shortDescription: 'Bilona-churned, golden, cultured.', description: 'Made the traditional way: cultured curd, churned by hand, slow-clarified. From a small herd of Gir cows in our Gujarat partner farm. The golden standard.', price: 1290, unit: '500ml', category: 'dairy', images: ['https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=900&q=85&auto=format&fit=crop'], farm: 'Gir Heritage Farms', origin: 'Gujarat', certifications: ['A2 Verified', 'India Organic'], stock: 25, rating: 4.9, reviewCount: 124, featured: true, tags: ['ghee', 'dairy'] },
    { name: 'Cold-Pressed Olive Oil', shortDescription: 'First press, low-acid, intensely fruity.', description: 'Single-estate Picual olives from the Rajasthan-based estate Olive India. Cold-pressed within hours of harvest. Acidity below 0.4%.', price: 880, unit: '500ml', category: 'pantry', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=900&q=85&auto=format&fit=crop'], origin: 'Rajasthan', stock: 30, rating: 4.7, reviewCount: 65, tags: ['oil', 'gift'] },
    { name: 'Heirloom Apples', shortDescription: 'Crisp, tart, Himachal-grown.', description: 'Royal Delicious and Granny Smith blend from small family orchards in Himachal. No wax, no polish — just freshness and bite.', price: 320, unit: 'kg', category: 'fruits', images: ['https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=900&q=85&auto=format&fit=crop'], origin: 'Himachal Pradesh', stock: 70, rating: 4.6, reviewCount: 78, season: 'Sep–Mar', tags: ['fruit'] },
    { name: 'Fresh Spinach Bunch', shortDescription: 'Tender leaves, picked this morning.', description: 'Living-soil grown spinach from our Lonavla farm. Triple-washed, never bagged in plastic. Best within 4 days of delivery.', price: 60, unit: 'bunch', category: 'vegetables', images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=900&q=85&auto=format&fit=crop'], origin: 'Lonavla', stock: 100, rating: 4.5, reviewCount: 41, tags: ['greens'] },
    { name: 'Sourdough Loaf', shortDescription: 'Wild-yeast, 36-hour fermentation.', description: 'Baked fresh in our Pune kitchen each morning. Stone-ground flour, sea salt, water, time. Naturally vegan, naturally extraordinary.', price: 240, unit: '500g loaf', category: 'bakery', images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=85&auto=format&fit=crop'], origin: 'Pune', stock: 20, rating: 4.9, reviewCount: 89, featured: true, tags: ['bread'] },
    { name: 'Cold-Brew Coffee', shortDescription: '14-hour steeped, single-origin.', description: 'Chikmagalur peaberry beans, coarse-ground, slow-steeped overnight. Smooth, low-acid, and ready to drink. Glass bottle, returnable.', price: 240, unit: '500ml bottle', category: 'beverages', images: ['https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=900&q=85&auto=format&fit=crop'], origin: 'Karnataka', stock: 40, rating: 4.7, reviewCount: 53, tags: ['coffee'] },
    { name: 'Organic Brown Rice', shortDescription: 'Short-grain, nutty, slow-grown.', description: 'Pesticide-free, grown using SRI methods in Kerala backwaters. The grain that gave us our standards.', price: 165, unit: '5kg', category: 'grains', images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&q=85&auto=format&fit=crop'], origin: 'Kerala', certifications: ['India Organic'], stock: 55, rating: 4.6, reviewCount: 67, tags: ['rice', 'staple'] },
    { name: 'Kombucha — Ginger Lemon', shortDescription: 'Fermented, fizzy, alive.', description: 'Brewed in small batches with green tea, raw ginger, and Coorg lemons. Naturally probiotic, naturally bright.', price: 220, unit: '750ml bottle', category: 'beverages', images: ['https://images.unsplash.com/photo-1556881286-fc6915169721?w=900&q=85&auto=format&fit=crop'], origin: 'Bengaluru', stock: 38, rating: 4.5, reviewCount: 32, tags: ['drink', 'probiotic'] },
];

const recipes = [
    { title: 'Roasted Heirloom Tomato Galette', excerpt: 'A rustic open-faced tart that lets summer tomatoes do the heavy lifting.', coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=85&auto=format&fit=crop', category: 'lunch', cookTime: 60, servings: 4, difficulty: 'medium', ingredients: ['1 kg Heirloom Tomatoes', '200g cold butter', '300g flour', 'Sea salt', 'Cracked pepper', 'Sourdough crumbs', '1 egg yolk'], steps: ['Make the pâte brisée by rubbing butter into flour. Rest 30m.', 'Slice tomatoes thick. Salt and drain on paper.', 'Roll out dough, top with crumbs, layer tomatoes.', 'Fold edges, brush with egg yolk.', 'Bake 200°C for 35 minutes.'], author: 'Harvest Kitchen' },
    { title: 'Honey-Roasted Carrots', excerpt: 'Five ingredients. Twenty minutes. Side dish hall-of-famer.', coverImage: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=1200&q=85&auto=format&fit=crop', category: 'dinner', cookTime: 25, servings: 4, difficulty: 'easy', ingredients: ['500g rainbow carrots', '3 tbsp Wild Mountain Honey', '2 tbsp olive oil', 'Sea salt', 'Thyme'], steps: ['Halve carrots lengthwise.', 'Toss with honey, olive oil, salt, thyme.', 'Roast at 220°C for 18-22 minutes until caramelised.'], author: 'Harvest Kitchen' },
    { title: 'Avocado Toast, Reimagined', excerpt: 'No basic toast — this one earns its place at brunch.', coverImage: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1200&q=85&auto=format&fit=crop', category: 'breakfast', cookTime: 10, servings: 2, difficulty: 'easy', ingredients: ['1 ripe Hass avocado', '2 slices Sourdough', 'Lime', 'Maldon salt', 'Aleppo pepper', 'Soft-boiled egg', 'Microgreens'], steps: ['Toast sourdough until golden.', 'Mash avocado with lime and Maldon.', 'Spread thickly. Top with egg and microgreens.', 'Finish with Aleppo pepper.'], author: 'Harvest Kitchen' },
    { title: 'Cold-Brew Affogato', excerpt: 'Indian summer\'s answer to dessert.', coverImage: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=1200&q=85&auto=format&fit=crop', category: 'dessert', cookTime: 5, servings: 2, difficulty: 'easy', ingredients: ['200ml Cold-Brew Coffee', '4 scoops vanilla bean ice cream', '20g dark chocolate', 'Sea salt'], steps: ['Place 2 scoops ice cream in each glass.', 'Pour 100ml cold brew over each.', 'Grate chocolate on top, finish with sea salt.'], author: 'Harvest Kitchen' },
];

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected. Seeding Harvest Co...');

    await Product.deleteMany({});
    for (const p of products) await Product.create(p);
    console.log(`✓ Inserted ${products.length} products`);

    await Recipe.deleteMany({});
    for (const r of recipes) await Recipe.create(r);
    console.log(`✓ Inserted ${recipes.length} recipes`);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@harvestco.farm';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
        await User.create({
            name: 'Admin',
            email: adminEmail,
            password: process.env.ADMIN_PASSWORD || 'admin123',
            role: 'admin',
        });
        console.log(`✓ Admin created: ${adminEmail}`);
    }

    console.log('\nDone! Admin login →', adminEmail, '/', process.env.ADMIN_PASSWORD || 'admin123');
    process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
