import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, ShoppingCart, ShieldCheck, Loader2 } from 'lucide-react';
import Scanner from '../components/Scanner';

const QRLogin = () => {
    const navigate = useNavigate();
    const [scannerActive, setScannerActive] = useState(false);
    const [error, setError] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleOpenScanner = () => {
        setError(null);
        setScannerActive(true);
    };

    const handleScanSuccess = async (decodedText) => {
        const cartId = decodedText.trim();
        if (!cartId) return;

        setIsVerifying(true);
        setError(null);
        setScannerActive(false);

        console.log("Verifying Cart ID:", cartId);

        try {
            const response = await fetch(`http://localhost:5000/api/carts/${encodeURIComponent(cartId)}`);
            const data = await response.json();

            if (response.ok && data.registered) {
                console.log("Cart QR Verified Successfully:", cartId);
                navigate('/welcome', { state: { cartId: data.cartId } });
            } else {
                setError(`Invalid Cart QR "${cartId}". Please use a registered smart cart.`);
                setIsVerifying(false);
            }
        } catch (err) {
            console.error("Cart verification API error:", err);
            setError("Database connection error. Is the server running?");
            setIsVerifying(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end))',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ width: '100%', maxWidth: '480px' }}
                className="glass-panel"
            >
                <div style={{ padding: '3.5rem 2.5rem' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{
                            display: 'inline-flex',
                            padding: '1.2rem',
                            borderRadius: '24px',
                            background: 'var(--primary-light)',
                            marginBottom: '1.5rem',
                            boxShadow: '0 10px 25px rgba(61, 106, 55, 0.1)'
                        }}>
                            <ShoppingCart size={44} color="var(--primary-color)" strokeWidth={1.5} />
                        </div>
                        <h1 className="title-gradient" style={{ fontSize: '2.6rem', fontWeight: '800', marginBottom: '0.75rem' }}>
                            Smart Cart Access
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                            Scan the QR code on your cart's handle <br />to unlock your personalized experience.
                        </p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                    background: '#fff5f5',
                                    color: '#d32f2f',
                                    padding: '1.2rem',
                                    borderRadius: '16px',
                                    marginBottom: '2rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    border: '1px solid #ffe3e3',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.8rem',
                                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.05)'
                                }}
                            >
                                <span style={{ textAlign: 'center' }}>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isVerifying ? (
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
                            <Loader2 className="animate-spin" color="var(--primary-color)" size={48} strokeWidth={1.5} />
                            <p style={{ fontWeight: '700', color: 'var(--primary-color)', letterSpacing: '0.02em' }}>Verifying Smart Cart Identity...</p>
                        </div>
                    ) : (
                        <button
                            onClick={handleOpenScanner}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '1.3rem',
                                fontSize: '1.2rem',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem'
                            }}
                        >
                            <QrCode size={26} strokeWidth={1.5} />
                            Open QR Scanner
                        </button>
                    )}

                    <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>
                        <ShieldCheck size={20} color="var(--success)" />
                        Encrypted Smart Link
                    </div>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.8rem' }}>Debug Mock Scan (Requires Server)</p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                            onClick={() => handleScanSuccess("cart 1")}
                            style={{ padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #2E7D32', color: '#2E7D32', background: 'white', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Mock cart 1
                        </button>
                        <button
                            onClick={() => handleScanSuccess("invalid_cart")}
                            style={{ padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #C62828', color: '#C62828', background: 'white', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Mock invalid
                        </button>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {scannerActive && (
                    <Scanner
                        title="Scan Cart QR"
                        onClose={() => setScannerActive(false)}
                        onScanSuccess={handleScanSuccess}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default QRLogin;
