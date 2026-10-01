import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

// Public read-only account (it cannot change anything on the server).
const DEMO_EMAIL = 'demo@harvestco.farm';
const DEMO_PASSWORD = 'demo-view-only';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const signIn = async (email, password) => {
        try {
            const u = await login(email, password);
            toast.success(u.role === 'demo' ? 'Exploring the admin console (read-only)' : `Welcome back, ${u.name.split(' ')[0]}`);
            navigate(u.role === 'admin' || u.role === 'demo' ? '/admin' : '/', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    const submit = (e) => {
        e.preventDefault();
        signIn(form.email, form.password);
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
                <div className="demo-box">
                    <p><strong>Just looking around?</strong> Open the admin console with live orders and stock. It is read-only and customer details are hidden.</p>
                    <button type="button" className="btn btn-outline btn-block" disabled={loading} onClick={() => signIn(DEMO_EMAIL, DEMO_PASSWORD)}>
                        <i className="fas fa-chart-line"></i> Try Admin Demo
                    </button>
                </div>
            </div>
        </section>
    );
}
