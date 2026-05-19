import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try { return JSON.parse(localStorage.getItem('hv_cart') || '[]'); }
        catch { return []; }
    });
    const [open, setOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('hv_cart', JSON.stringify(items));
    }, [items]);

    const addItem = (product, qty = 1) => {
        setItems((prev) => {
            const found = prev.find((i) => i._id === product._id);
            if (found) {
                return prev.map((i) =>
                    i._id === product._id ? { ...i, quantity: i.quantity + qty } : i
                );
            }
            return [...prev, {
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.images?.[0],
                slug: product.slug,
                unit: product.unit,
                quantity: qty,
            }];
        });
    };

    const removeItem = (id) => setItems((prev) => prev.filter((i) => i._id !== id));

    const updateQty = (id, delta) =>
        setItems((prev) =>
            prev.map((i) => (i._id === id ? { ...i, quantity: i.quantity + delta } : i))
                .filter((i) => i.quantity > 0)
        );

    const clear = () => setItems([]);

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, updateQty, clear, subtotal, count, open, setOpen }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
