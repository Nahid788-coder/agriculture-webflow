import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';

const AuthContext = createContext(null);

const save = (token, user) => {
    if (token) localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

// Checked once per page load, outside React, so StrictMode cannot run it twice.
let verifyOnce = null;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [loading, setLoading] = useState(false);

    // Refresh the stored user (role, wishlist) once, and drop it if the token expired.
    useEffect(() => {
        if (!localStorage.getItem('token')) return;
        verifyOnce ??= api.get('/auth/me').then((r) => r.data.user);
        verifyOnce
            .then((u) => { save(null, u); setUser(u); })
            .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); });
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            save(data.token, data.user);
            setUser(data.user);
            return data.user;
        } finally { setLoading(false); }
    };

    const register = async (payload) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', payload);
            save(data.token, data.user);
            setUser(data.user);
            return data.user;
        } finally { setLoading(false); }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        verifyOnce = null;
        setUser(null);
    };

    const isWished = useCallback((id) => Boolean(user?.wishlist?.includes(id)), [user]);

    /** Returns false when the visitor must sign in first. */
    const toggleWishlist = useCallback(async (product) => {
        if (!user) return false;
        if (user.role === 'demo') { toast('The demo admin is read-only.'); return true; }
        const had = user.wishlist?.includes(product._id);
        const optimistic = { ...user, wishlist: had ? user.wishlist.filter((x) => x !== product._id) : [...(user.wishlist || []), product._id] };
        setUser(optimistic);
        try {
            const { data } = await api.post(`/wishlist/${product._id}`);
            const next = { ...optimistic, wishlist: data.wishlist };
            save(null, next);
            setUser(next);
            toast.success(data.added ? `${product.name} saved to your wishlist` : 'Removed from wishlist');
        } catch (err) {
            setUser(user);
            toast.error(errorMessage(err, 'Could not update your wishlist'));
        }
        return true;
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isWished, toggleWishlist }}>
            {children}
        </AuthContext.Provider>
    );
}

 
export const useAuth = () => useContext(AuthContext);
