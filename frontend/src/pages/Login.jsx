import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        try {
            const u = await login(form.email, form.password);
            toast.success(`Welcome back, ${u.name}`);
            navigate(u.role === 'admin' ? '/admin' : '/', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="label-mono">Sign in</div>
                <h1 style={{ marginTop: 14 }}>Welcome <em>back.</em></h1>
                <p className="sub">Sign in to your Harvest Co. account.</p>
                <form onSubmit={submit}>
                    <div className="field">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
                    </div>
                    <div className="field">
                        <label>Password</label>
                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In →'}
                    </button>
                </form>
                <p className="auth-foot">No account? <Link to="/register">Create one</Link></p>
                <div style={{ marginTop: 24, padding: 16, border: '1px solid var(--border)', background: 'var(--bg-2)', borderRadius: 12, fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.5 }}>
                    Demo Admin: admin@harvestco.farm / admin123
                </div>
            </div>
        </section>
    );
}
