import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobOpen, setMobOpen] = useState(false);
    const { user, logout } = useAuth();
    const { count, setOpen: setCartOpen } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const links = [
        { to: '/shop', label: 'Shop' },
        { to: '/box-builder', label: 'Box Builder' },
        { to: '/recipes', label: 'Recipes' },
        { to: '/about', label: 'About' },
    ];

    return (
        <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-inner">
                <Link to="/" className="brand">
                    <span className="brand-leaf">🌱</span>
                    Harvest <em>Co.</em>
                </Link>

                <ul className={`nav-menu ${mobOpen ? 'open' : ''}`}>
                    {links.map((l) => (
                        <li key={l.to}>
                            <NavLink
                                to={l.to}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobOpen(false)}
                            >
                                {l.label}
                            </NavLink>
                        </li>
                    ))}
                    {user?.role === 'admin' && (
                        <li><NavLink to="/admin" className="nav-link">Admin</NavLink></li>
                    )}
                    {user && <li><NavLink to="/orders" className="nav-link">Orders</NavLink></li>}
                </ul>

                <div className="nav-actions">
                    {user ? (
                        <button className="icon-btn" onClick={() => { logout(); navigate('/'); }} aria-label="Logout">
                            <i className="fas fa-right-from-bracket"></i>
                        </button>
                    ) : (
                        <Link to="/login" className="icon-btn" aria-label="Login">
                            <i className="far fa-user"></i>
                        </Link>
                    )}
                    <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="Cart">
                        <i className="fas fa-bag-shopping"></i>
                        <span className={`icon-badge ${count === 0 ? 'hidden' : ''}`}>{count}</span>
                    </button>
                    <button className="hamburger" onClick={() => setMobOpen((o) => !o)} aria-label="Menu">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
