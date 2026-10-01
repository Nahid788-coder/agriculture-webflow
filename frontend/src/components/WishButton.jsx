import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function WishButton({ product, className = 'wish-btn' }) {
    const { isWished, toggleWishlist } = useAuth();
    const navigate = useNavigate();
    const on = isWished(product._id);

    const click = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const ok = await toggleWishlist(product);
        if (!ok) {
            toast('Sign in to save products to your wishlist');
            navigate('/login');
        }
    };

    return (
        <button className={`${className} ${on ? 'on' : ''}`} onClick={click} aria-label={on ? 'Remove from wishlist' : 'Save to wishlist'} aria-pressed={on}>
            <i className={`${on ? 'fas' : 'far'} fa-heart`}></i>
        </button>
    );
}
