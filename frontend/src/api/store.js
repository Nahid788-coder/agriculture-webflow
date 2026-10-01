import api from './axios';

// A tiny shared cache. Pages that need the same data share one request (even when they
// ask at the same moment), and the answer is reused until it expires or is invalidated.
const cache = new Map(); // key -> { data, at, ttl }
const inflight = new Map(); // key -> Promise

export function cached(key, fetcher, ttl = 5 * 60_000) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < hit.ttl) return Promise.resolve(hit.data);
    if (inflight.has(key)) return inflight.get(key);
    const p = fetcher()
        .then((data) => {
            cache.set(key, { data, at: Date.now(), ttl });
            return data;
        })
        .finally(() => inflight.delete(key));
    inflight.set(key, p);
    return p;
}

/** Synchronous read so a page can render instantly when the data is already loaded. */
export const peek = (key) => {
    const hit = cache.get(key);
    return hit && Date.now() - hit.at < hit.ttl ? hit.data : undefined;
};

export const invalidate = (...prefixes) => {
    for (const key of cache.keys()) if (prefixes.some((p) => key.startsWith(p))) cache.delete(key);
};

const get = (url, params) => () => api.get(url, { params }).then((r) => r.data);

export const keys = {
    products: 'products',
    recipes: 'recipes',
    offers: 'offers',
    product: (slug) => `product:${slug}`,
    recipe: (slug) => `recipe:${slug}`,
    pincode: (pin) => `pincode:${pin}`,
};

export const getProducts = () => cached(keys.products, get('/products'), 2 * 60_000);
export const getRecipes = () => cached(keys.recipes, get('/recipes'), 10 * 60_000);
export const getOffers = () => cached(keys.offers, get('/coupons/active'), 10 * 60_000);
export const getProductPage = (slug) => cached(keys.product(slug), get(`/products/${slug}`), 60_000);
// Coming from the recipes list, the recipe is already loaded: reuse it instead of fetching again.
export const getRecipe = (slug) => {
    const fromList = peek(keys.recipes)?.find((r) => r.slug === slug);
    return fromList ? Promise.resolve(fromList) : cached(keys.recipe(slug), get(`/recipes/${slug}`), 10 * 60_000);
};
export const checkPincode = (pin) => cached(keys.pincode(pin), get('/delivery/check', { pincode: pin }), 30 * 60_000);

/** After an order or a stock change, product data (stock, ratings) must be fetched fresh. */
export const invalidateCatalog = () => invalidate('products', 'product:');
