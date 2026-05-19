import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import PhoneInput from '../components/PhoneInput.jsx';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        try {
            const u = await register(form);
            toast.success(`Welcome to Harvest, ${u.name}`);
            navigate('/', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="label-mono">Join Harvest</div>
                <h1 style={{ marginTop: 14 }}>Hello, <em>stranger.</em></h1>
                <p className="sub">Create an account to track orders and manage subscriptions.</p>
                <form onSubmit={submit}>
                    <div className="field">
                        <label>Full Name</label>
                        <input name="name" value={form.name} onChange={onChange} required />
                    </div>
                    <div className="field">
                        <label>Email</label>
                        <input name="email" type="email" value={form.email} onChange={onChange} required autoComplete="email" />
                    </div>
                    <div className="field">
                        <label>Phone</label>
                        <PhoneInput name="phone" value={form.phone} onChange={onChange} />
                    </div>
                    <div className="field">
                        <label>Password</label>
                        <input name="password" type="password" value={form.password} onChange={onChange} minLength={6} required autoComplete="new-password" />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Account →'}
                    </button>
                </form>
                <p className="auth-foot">Already a member? <Link to="/login">Sign in</Link></p>
            </div>
        </section>
    );
}
