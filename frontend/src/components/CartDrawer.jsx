import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function CartDrawer() {
    const { items, removeItem, updateQty, subtotal, count, open, setOpen } = useCart();
    const navigate = useNavigate();

    const checkout = () => {
        setOpen(false);
        navigate('/checkout');
    };

    const shipping = subtotal >= 999 ? 0 : 49;

    return (
        <>
            <div className={`cart-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
            <aside className={`cart-drawer ${open ? 'open' : ''}`}>
                <div className="cart-head">
                    <h3>Your <em>Bag</em> <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>({count})</span></h3>
                    <button className="cart-close" onClick={() => setOpen(false)}><i className="fas fa-xmark"></i></button>
                </div>

                <div className="cart-body">
                    {items.length === 0 ? (
                        <div className="cart-empty">
                            <i className="fas fa-bag-shopping"></i>
                            <h4>Your bag is empty</h4>
                            <p>Discover something fresh.</p>
                        </div>
                    ) : (
                        items.map((it) => (
                            <div key={it._id} className="cart-item">
                                <img src={it.image} alt={it.name} />
                                <div className="cart-item-info">
                                    <h4>{it.name}</h4>
                                    <div className="price">₹{it.price * it.quantity}</div>
                                    <div className="qty-control">
                                        <button onClick={() => updateQty(it._id, -1)}><i className="fas fa-minus"></i></button>
                                        <span>{it.quantity}</span>
                                        <button onClick={() => updateQty(it._id, 1)}><i className="fas fa-plus"></i></button>
                                    </div>
                                </div>
                                <button onClick={() => removeItem(it._id)} className="cart-close" style={{ width: 30, height: 30, fontSize: 11 }} aria-label="Remove">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-foot">
                        <div className="cart-summary"><span>Subtotal</span><span>₹{subtotal}</span></div>
                        <div className="cart-summary"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                        <div className="cart-summary total"><span>Total</span><strong>₹{subtotal + shipping}</strong></div>
                        <button className="btn btn-primary btn-block" onClick={checkout}>Checkout →</button>
                    </div>
                )}
            </aside>
        </>
    );
}
