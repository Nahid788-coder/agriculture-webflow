import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCached } from '../hooks/useCached';
import { keys, getProducts } from '../api/store';
import ProductCard from '../components/ProductCard.jsx';

export default function Wishlist() {
    const { user } = useAuth();
    // Built from the shared catalog and the ids that come with the user: no extra request.
    const { data: products, loading } = useCached(keys.products, getProducts);
    const saved = useMemo(
        () => (products || []).filter((p) => user?.wishlist?.includes(p._id)),
        [products, user]
    );

    return (
        <>
            <header className="page-title-bar">
                <div className="container">
                    <div className="label-mono">Saved for later</div>
                    <h1 style={{ marginTop: 18 }}>Your <em>wishlist.</em></h1>
                    <p>{user ? 'Products you have saved. Add them to your bag whenever you are ready.' : 'Sign in to save products and find them here on any device.'}</p>
                </div>
            </header>
            <section className="section">
                <div className="container">
                    {!user ? (
                        <div className="empty-card">
                            <i className="far fa-heart"></i>
                            <h3>Nothing saved yet</h3>
                            <Link to="/login" className="btn btn-primary">Sign in</Link>
                        </div>
                    ) : loading ? (
                        <div className="product-grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skel" style={{ aspectRatio: '4/5' }}></div>)}</div>
                    ) : saved.length === 0 ? (
                        <div className="empty-card">
                            <i className="far fa-heart"></i>
                            <h3>Nothing saved yet</h3>
                            <p>Tap the heart on any product to save it here.</p>
                            <Link to="/shop" className="btn btn-primary">Browse the shop</Link>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {saved.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
