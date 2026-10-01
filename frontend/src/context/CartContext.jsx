import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const MAX_PER_ITEM = 25;

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try { return JSON.parse(localStorage.getItem('hv_cart') || '[]'); }
        catch { return []; }
    });
    const [open, setOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('hv_cart', JSON.stringify(items));
    }, [items]);

    const limitOf = (i) => Math.min(MAX_PER_ITEM, i.stock ?? MAX_PER_ITEM);

    /** Adds up to the available stock. Returns how many were actually added. */
    const addItem = (product, qty = 1) => {
        if (product.stock === 0) { toast.error(`${product.name} is out of stock`); return 0; }
        const found = items.find((i) => i._id === product._id);
        const cap = Math.min(MAX_PER_ITEM, product.stock ?? MAX_PER_ITEM);
        const current = found?.quantity || 0;
        const add = Math.max(0, Math.min(qty, cap - current));
        if (add === 0) { toast(`Only ${cap} of ${product.name} available`); return 0; }
        setItems((prev) => found
            ? prev.map((i) => (i._id === product._id ? { ...i, quantity: i.quantity + add, stock: product.stock } : i))
            : [...prev, {
                _id: product._id, name: product.name, price: product.price, image: product.images?.[0],
                slug: product.slug, unit: product.unit, stock: product.stock, quantity: add,
            }]);
        return add;
    };

    const removeItem = (id) => setItems((prev) => prev.filter((i) => i._id !== id));

    const updateQty = (id, delta) =>
        setItems((prev) =>
            prev.map((i) => {
                if (i._id !== id) return i;
                const next = Math.min(i.quantity + delta, limitOf(i));
                if (delta > 0 && next === i.quantity) toast(`Only ${limitOf(i)} available`);
                return { ...i, quantity: next };
            }).filter((i) => i.quantity > 0)
        );

    const clear = () => setItems([]);

    // Prices shown here are a preview; the server prices every order from the database.
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, subtotal, count, open, setOpen }}>
            {children}
        </CartContext.Provider>
    );
}

 
export const useCart = () => useContext(CartContext);
