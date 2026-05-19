import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    });
    const [loading, setLoading] = useState(false);
    const verifiedRef = useRef(false);

    useEffect(() => {
        if (verifiedRef.current) return;
        const token = localStorage.getItem('token');
        if (!token || user) return;
        verifiedRef.current = true;
        const ctrl = new AbortController();
        api.get('/auth/me', { signal: ctrl.signal })
            .then((r) => {
                setUser(r.data.user);
                localStorage.setItem('user', JSON.stringify(r.data.user));
            })
            .catch((err) => {
                if (err.code === 'ERR_CANCELED') return;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            });
        return () => ctrl.abort();
    }, [user]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } finally { setLoading(false); }
    };

    const register = async (payload) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', payload);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } finally { setLoading(false); }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        verifiedRef.current = false;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
