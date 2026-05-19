import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <HashRouter>
            <AuthProvider>
                <CartProvider>
                    <App />
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                background: '#fdfaf2',
                                color: '#2a1a13',
                                border: '1.5px solid #ebd9bf',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: 14,
                                fontWeight: 500,
                                borderRadius: 8,
                                padding: '14px 18px',
                                boxShadow: '0 18px 50px rgba(42, 26, 19, 0.12)',
                            },
                        }}
                    />
                </CartProvider>
            </AuthProvider>
        </HashRouter>
    </StrictMode>
);
