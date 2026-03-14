import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const Welcome = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleStartShopping = (e) => {
        e.preventDefault();
        if (email.includes('@')) {
            navigate('/shopping', { state: { email } });
        } else {
            alert("Please enter a valid email address.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="container flex-center"
            style={{ minHeight: '100vh', background: 'transparent' }}
        >
            <div className="glass-panel" style={{ padding: '3.5rem 2.5rem', width: '100%', maxWidth: '480px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative Soft Background Blob */}
                <div style={{
                    position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px',
                    background: 'var(--primary-light)', filter: 'blur(40px)', borderRadius: '50%', zIndex: -1, opacity: 0.6
                }} />

                <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                >
                    <div className="flex-center" style={{
                        width: '90px', height: '90px',
                        background: 'linear-gradient(135deg, #3d6a37, #6b8e6b)',
                        borderRadius: '24px',
                        margin: '0 auto 2rem',
                        boxShadow: '0 20px 40px rgba(61, 106, 55, 0.15)',
                        transform: 'rotate(-5deg)'
                    }}>
                        <ShoppingBag size={44} color="white" strokeWidth={1.5} />
                    </div>
                </motion.div>

                <h1 className="title-gradient" style={{ fontSize: '2.8rem', marginBottom: '0.75rem', fontWeight: '800' }}>Shopping Time</h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                    A modern, effortless supermarket experience. <br /><strong>Sign in to begin.</strong>
                </p>

                <form onSubmit={handleStartShopping} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="input-group" style={{ margin: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label className="input-label" style={{ color: 'var(--primary-color)', fontWeight: '600', letterSpacing: '0.05em' }}>CUSTOMER EMAIL</label>
                        </div>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="hello@example.com"
                            style={{
                                background: '#f8faf8',
                                border: '2px solid transparent',
                                fontSize: '1.05rem',
                                transition: 'all 0.3s ease'
                            }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary-color)' }} />
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Your receipt will be sent here automatically.
                            </small>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.15rem', borderRadius: '20px' }}>
                        Start Your Visit
                        <ArrowRight size={22} style={{ marginLeft: '8px' }} />
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Powered by <strong>SmartStore Technology</strong>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Welcome;
