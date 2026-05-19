import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product, index = 0 }) {
    const { addItem } = useCart();

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        toast.success(`${product.name} added to bag`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: (index % 8) * 0.06 }}
        >
            <Link to={`/product/${product.slug}`} className="product-card">
                <div className="product-card-img">
                    <img src={product.images?.[0]} alt={product.name} loading="lazy" />
                    <div className="product-badges">
                        {product.organic && <span className="product-badge organic">Organic</span>}
                        {product.featured && <span className="product-badge feat">Featured</span>}
                    </div>
                    <div className="product-actions">
                        <button className="product-act-btn" onClick={handleAdd} aria-label="Add to bag">
                            <i className="fas fa-bag-shopping"></i>
                        </button>
                    </div>
                </div>
                <div className="product-card-cat">{product.category}</div>
                <h3>{product.name}</h3>
                <div className="product-card-meta">{product.farm} · {product.origin}</div>
                <div className="product-card-foot">
                    <div className="product-card-price">₹{product.price}<small>/{product.unit}</small></div>
                    {product.rating > 0 && (
                        <div className="product-card-rating">
                            <i className="fas fa-star"></i> {product.rating.toFixed(1)}
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
