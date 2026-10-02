import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../api/axios';

const CATEGORIES = ['vegetables', 'fruits', 'grains', 'dairy', 'pantry', 'beverages', 'bakery'];

const toForm = (p) => ({
    name: p?.name || '',
    category: p?.category || 'vegetables',
    price: p?.price ?? '',
    unit: p?.unit || 'kg',
    stock: p?.stock ?? 50,
    images: (p?.images || []).join('\n'),
    shortDescription: p?.shortDescription || '',
    description: p?.description || '',
    farm: p?.farm || 'Harvest Co. Farms',
    origin: p?.origin || '',
    season: p?.season || '',
    certifications: (p?.certifications || []).join(', '),
    tags: (p?.tags || []).join(', '),
    organic: p?.organic ?? true,
    featured: p?.featured ?? false,
    subscriptionEligible: p?.subscriptionEligible ?? true,
});

/** Add or edit a product (admin only). Passing `product` edits it; otherwise a new one is created. */
export default function ProductForm({ product, onClose, onSaved }) {
    const [f, setF] = useState(() => toForm(product));
    const [busy, setBusy] = useState(false);
    const editing = Boolean(product);
    const firstImage = f.images.split(/[\n,]+/).map((s) => s.trim()).find(Boolean);

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const body = { ...f, price: Number(f.price), stock: Number(f.stock) };
            const { data } = editing ? await api.put(`/products/${product._id}`, body) : await api.post('/products', body);
            toast.success(editing ? `${data.name} updated` : `${data.name} added to the shop`);
            onSaved(data, editing);
        } catch (err) {
            toast.error(errorMessage(err, 'Could not save the product'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <form className="modal product-form" onSubmit={submit} role="dialog" aria-modal="true" aria-label={editing ? 'Edit product' : 'Add product'}>
                <div className="modal-head">
                    <h3>{editing ? 'Edit product' : 'Add a product'}</h3>
                    <button type="button" className="cart-close" onClick={onClose} aria-label="Close"><i className="fas fa-xmark"></i></button>
                </div>

                <div className="modal-body">
                    <div className="pf-grid">
                        <div className="field span-2"><label>Name *</label><input value={f.name} onChange={set('name')} required maxLength={80} placeholder="e.g. Alphonso Mangoes" /></div>
                        <div className="field"><label>Category *</label>
                            <select value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}</select>
                        </div>
                        <div className="field"><label>Price (₹) *</label><input type="number" min="1" step="0.01" value={f.price} onChange={set('price')} required /></div>
                        <div className="field"><label>Unit *</label><input value={f.unit} onChange={set('unit')} required placeholder="kg, 500g jar, bunch…" /></div>
                        <div className="field"><label>Stock *</label><input type="number" min="0" step="1" value={f.stock} onChange={set('stock')} required /></div>

                        <div className="field span-2">
                            <label>Image links * <span className="muted small">(one per line, must start with https://)</span></label>
                            <div className="pf-images">
                                <textarea value={f.images} onChange={set('images')} required rows={3} placeholder="https://images.unsplash.com/photo-…" />
                                <div className="pf-preview">{firstImage ? <img src={firstImage} alt="Preview" /> : <span>Preview</span>}</div>
                            </div>
                        </div>

                        <div className="field span-2"><label>Short description *</label><input value={f.shortDescription} onChange={set('shortDescription')} required maxLength={160} placeholder="One line shown under the name" /></div>
                        <div className="field span-2"><label>Description *</label><textarea value={f.description} onChange={set('description')} required rows={4} maxLength={1500} /></div>

                        <div className="field"><label>Farm</label><input value={f.farm} onChange={set('farm')} /></div>
                        <div className="field"><label>Origin</label><input value={f.origin} onChange={set('origin')} placeholder="e.g. Ratnagiri, Maharashtra" /></div>
                        <div className="field"><label>Season</label><input value={f.season} onChange={set('season')} placeholder="e.g. Apr–Jun" /></div>
                        <div className="field"><label>Certifications</label><input value={f.certifications} onChange={set('certifications')} placeholder="India Organic, PGS-Organic" /></div>
                        <div className="field span-2"><label>Search tags</label><input value={f.tags} onChange={set('tags')} placeholder="fruit, summer, juice" /></div>
                    </div>

                    <div className="pf-checks">
                        <label><input type="checkbox" checked={f.organic} onChange={set('organic')} /> Organic</label>
                        <label><input type="checkbox" checked={f.featured} onChange={set('featured')} /> Featured on the home page</label>
                        <label><input type="checkbox" checked={f.subscriptionEligible} onChange={set('subscriptionEligible')} /> Can go in subscription boxes</label>
                    </div>
                </div>

                <div className="modal-foot">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}</button>
                </div>
            </form>
        </div>
    );
}
