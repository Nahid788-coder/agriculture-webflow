import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { HttpError, isId, round2 } from './http.js';

export const FREE_SHIPPING_OVER = 999;
export const SHIPPING_FEE = 49;
export const TAX_RATE = 0.05;

/** Turns the browser's [{product, quantity}] into a clean, merged list. Never trusts prices. */
function cleanItems(raw) {
    if (!Array.isArray(raw) || raw.length === 0) throw new HttpError(400, 'Your bag is empty.');
    if (raw.length > 40) throw new HttpError(400, 'Too many different items in one order.');
    const merged = new Map();
    for (const it of raw) {
        const id = String(it?.product ?? '');
        const qty = Number(it?.quantity);
        if (!isId(id) || !Number.isInteger(qty) || qty < 1 || qty > 25) {
            throw new HttpError(400, 'One of the items in your bag is invalid.');
        }
        merged.set(id, (merged.get(id) || 0) + qty);
    }
    return merged;
}

async function loadCoupon(code, subtotal) {
    const c = await Coupon.findOne({ code: String(code).trim().toUpperCase() }).lean();
    if (!c || !c.active) throw new HttpError(400, 'That coupon code is not valid.');
    if (c.expiresAt && c.expiresAt < new Date()) throw new HttpError(400, 'That coupon has expired.');
    if (c.usageLimit && c.used >= c.usageLimit) throw new HttpError(400, 'That coupon has been fully used.');
    if (subtotal < (c.minOrder || 0)) {
        throw new HttpError(400, `Add items worth ₹${Math.ceil(c.minOrder - subtotal)} more to use ${c.code}.`);
    }
    const raw = c.type === 'percent' ? (subtotal * c.value) / 100 : c.value;
    const discount = round2(Math.min(raw, c.maxDiscount ?? Infinity, subtotal));
    return { coupon: c, discount };
}

/**
 * Prices a bag on the server from the database: item prices, stock, coupon, shipping and tax.
 * The same function backs the checkout preview and the real order, so they always agree.
 */
export async function quote(rawItems, couponCode) {
    const merged = cleanItems(rawItems);
    const products = await Product.find({ _id: { $in: [...merged.keys()] } }).lean();
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const items = [];
    for (const [id, quantity] of merged) {
        const p = byId.get(id);
        if (!p) throw new HttpError(400, 'An item in your bag is no longer sold. Please remove it.');
        if (p.stock < quantity) {
            throw new HttpError(409, p.stock === 0 ? `${p.name} is out of stock.` : `Only ${p.stock} of ${p.name} left.`);
        }
        items.push({ product: p._id, name: p.name, image: p.images?.[0], price: p.price, unit: p.unit, quantity });
    }

    const subtotal = round2(items.reduce((s, i) => s + i.price * i.quantity, 0));
    let discount = 0;
    let coupon = null;
    if (couponCode) ({ coupon, discount } = await loadCoupon(couponCode, subtotal));

    const afterDiscount = subtotal - discount;
    const shipping = afterDiscount >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
    const tax = round2(afterDiscount * TAX_RATE);
    const total = round2(afterDiscount + shipping + tax);

    return {
        items,
        subtotal,
        discount,
        coupon: coupon ? { _id: coupon._id, code: coupon.code, description: coupon.description, usageLimit: coupon.usageLimit } : null,
        shipping,
        tax,
        total,
    };
}

/** Takes stock for every item, or none: if one item sold out meanwhile, earlier ones are put back. */
export async function reserveStock(items) {
    const taken = [];
    for (const it of items) {
        const r = await Product.updateOne({ _id: it.product, stock: { $gte: it.quantity } }, { $inc: { stock: -it.quantity } });
        if (r.modifiedCount !== 1) {
            await releaseStock(taken);
            throw new HttpError(409, `${it.name} just sold out. Please update your bag.`);
        }
        taken.push(it);
    }
}

export const releaseStock = (items) =>
    Promise.all(items.map((it) => Product.updateOne({ _id: it.product }, { $inc: { stock: it.quantity } })));

/** Counts one use of a coupon, respecting its usage limit even with orders arriving together. */
export async function useCoupon(coupon) {
    if (!coupon) return;
    const filter = { _id: coupon._id };
    if (coupon.usageLimit) filter.used = { $lt: coupon.usageLimit };
    const r = await Coupon.updateOne(filter, { $inc: { used: 1 } });
    if (r.modifiedCount !== 1) throw new HttpError(400, 'That coupon has just been fully used.');
}

/* ---------------- Subscription boxes ---------------- */

export const BOXES = {
    small: { label: 'Small', max: 6, multiplier: 1 },
    medium: { label: 'Medium', max: 10, multiplier: 0.92 },
    large: { label: 'Large', max: 15, multiplier: 0.88 },
    family: { label: 'Family', max: 22, multiplier: 0.85 },
};
export const FREQUENCIES = ['weekly', 'biweekly', 'monthly'];

/** Prices a subscription box from the database, with the size discount applied. */
export async function priceBox(rawItems, size) {
    const box = BOXES[size];
    if (!box) throw new HttpError(400, 'Please choose a box size.');
    const merged = cleanItems(rawItems);
    const count = [...merged.values()].reduce((a, b) => a + b, 0);
    if (count > box.max) throw new HttpError(400, `A ${box.label} box holds up to ${box.max} items.`);

    const products = await Product.find({ _id: { $in: [...merged.keys()] }, subscriptionEligible: true }).lean();
    if (products.length !== merged.size) throw new HttpError(400, 'Some items cannot go in a subscription box.');
    const items = products.map((p) => ({
        product: p._id, name: p.name, image: p.images?.[0], price: p.price, quantity: merged.get(String(p._id)),
    }));
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { items, subtotal, boxPrice: Math.round(subtotal * box.multiplier), box };
}
