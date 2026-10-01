import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCached } from '../hooks/useCached';
import { keys, getProducts } from '../api/store';
import ProductCard from '../components/ProductCard.jsx';

const CATS = [
    { id: 'all', label: 'All' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'pantry', label: 'Pantry' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'grains', label: 'Grains' },
    { id: 'bakery', label: 'Bakery' },
    { id: 'beverages', label: 'Beverages' },
];

export default function Shop() {
    const [params, setParams] = useSearchParams();
    const cat = params.get('category') || 'all';
    const [sort, setSort] = useState('default');
    const [search, setSearch] = useState('');

    // The whole catalog is loaded once; filters, search and sorting happen here without new requests.
    const { data: products, loading } = useCached(keys.products, getProducts);

    const filtered = useMemo(() => {
        if (!products) return [];
        const q = search.trim().toLowerCase();
        const list = products.filter((p) =>
            (cat === 'all' || p.category === cat) &&
            (!q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q)))
        );
        const by = {
            'price-asc': (a, b) => a.price - b.price,
            'price-desc': (a, b) => b.price - a.price,
            rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
            newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        }[sort];
        // In-stock items first, so shoppers see what they can buy.
        return [...list].sort((a, b) => (a.stock === 0) - (b.stock === 0) || (by ? by(a, b) : 0));
    }, [products, cat, search, sort]);

    const categoryCount = new Set((products || []).map((p) => p.category)).size;

    return (
        <>
            <header className="page-title-bar">
                <div className="container">
                    <div className="label-mono">All produce · Index</div>
                    <h1 style={{ marginTop: 18 }}>The <em>shop.</em></h1>
                    <p>Hand-picked, slow-grown, honestly priced.{products ? ` ${products.length} items across ${categoryCount} categories.` : ''}</p>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', alignItems: 'center', marginBottom: 30 }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {CATS.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        if (c.id === 'all') params.delete('category');
                                        else params.set('category', c.id);
                                        setParams(params);
                                    }}
                                    className={`builder-filter-pill ${cat === c.id ? 'active' : ''}`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <input
                                type="search"
                                placeholder="Search produce..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ width: 220, padding: '12px 18px', fontSize: 14 }}
                            />
                            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 200 }}>
                                <option value="default">Featured</option>
                                <option value="newest">Newest</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="product-grid">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i}>
                                    <div className="skel" style={{ aspectRatio: '4/5' }}></div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: 80, color: 'var(--ink-3)', fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 22 }}>Nothing here. Try a different filter.</p>
                    ) : (
                        <div className="product-grid">
                            {filtered.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
