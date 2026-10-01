import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import BackToTop from './components/BackToTop.jsx';
import PageLoader from './components/PageLoader.jsx';

import Home from './pages/Home.jsx';

// Other pages load on demand, so the first visit only downloads what it shows.
const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Recipes = lazy(() => import('./pages/Recipes.jsx'));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail.jsx'));
const BoxBuilder = lazy(() => import('./pages/BoxBuilder.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));

import { useAuth } from './context/AuthContext.jsx';

function ProtectedRoute({ children, adminOnly }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.role !== 'admin' && user.role !== 'demo') return <Navigate to="/" replace />;
    return children;
}

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
    return null;
}

export default function App() {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 1000);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <PageLoader gone={loaded} />
            <ScrollToTop />
            <ScrollProgress />
            <Navbar />
            <main>
                <Suspense fallback={<div style={{ minHeight: '70vh' }} />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/box-builder" element={<BoxBuilder />} />
                    <Route path="/recipes" element={<Recipes />} />
                    <Route path="/recipes/:slug" element={<RecipeDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                </Suspense>
            </main>
            <Footer />
            <CartDrawer />
            <BackToTop />
        </>
    );
}
