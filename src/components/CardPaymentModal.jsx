import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, X, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CardPaymentModal = ({ onClose, finalAmount, customerEmail, items }) => {
    const navigate = useNavigate();
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Basic formatting for card number
    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        // Format as XXXX XXXX XXXX XXXX
        const formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
        if (formattedValue.length <= 19) {
            setCardNumber(formattedValue);
        }
    };

    // Basic formatting for expiry date
    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        if (value.length <= 5) {
            setExpiry(value);
        }
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 4) {
            setCvv(value);
        }
    };

    const handlePayNow = (e) => {
        e.preventDefault();

        // Basic validation
        if (cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3 || name.trim() === '') {
            alert("Please fill in all card details correctly.");
            return;
        }

        setIsProcessing(true);

        // Simulate payment gateway processing time
        setTimeout(async () => {
            try {
                // Save the successfully paid order to MongoDB
                const orderData = {
                    customerEmail,
                    items: items.map(item => ({
                        barcode: item.barcode,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        sensorQuantity: item.sensorQuantity || item.quantity
                    })),
                    totalAmount: finalAmount
                };

                const response = await fetch('http://localhost:5000/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                if (!response.ok) {
                    console.error("Warning: Order payment succeeded but failed to save to database.");
                }
            } catch (error) {
                console.error("Error saving order to database:", error);
            } finally {
                setIsProcessing(false);
                onClose(); // Close the modal
                // Navigate to the success screen with the email state
                navigate('/success', { state: { email: customerEmail } });
            }
        }, 2000);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(61, 106, 55, 0.15)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '1.5rem'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', position: 'relative', background: 'var(--surface-color)' }}
            >
                {!isProcessing && (
                    <button
                        onClick={onClose}
                        className="btn-icon"
                        style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#6B7280' }}
                    >
                        <X size={24} />
                    </button>
                )}

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '64px', height: '64px', borderRadius: '20px',
                        background: 'var(--primary-light)', marginBottom: '1.2rem',
                        boxShadow: '0 8px 20px rgba(61, 106, 55, 0.1)'
                    }}>
                        <CreditCard size={32} color="var(--primary-color)" strokeWidth={1.5} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-color)', letterSpacing: '-0.02em' }}>Payment Details</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', fontWeight: '500' }}>
                        Complete your purchase of <strong style={{ color: 'var(--primary-color)' }}>Rs. {finalAmount.toLocaleString()}</strong>
                    </p>
                </div>

                {isProcessing ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 0' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                            style={{ display: 'inline-block', marginBottom: '1.5rem' }}
                        >
                            <div style={{
                                width: '48px', height: '48px',
                                border: '4px solid var(--primary-light)',
                                borderTopColor: 'var(--primary-color)',
                                borderRadius: '50%'
                            }} />
                        </motion.div>
                        <h3 style={{ color: 'var(--primary-color)', fontWeight: '700', fontSize: '1.1rem' }}>Processing Payment...</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>Securing your transaction securely</p>
                    </div>
                ) : (
                    <form onSubmit={handlePayNow} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginLeft: '4px' }}>Cardholder Name</label>
                            <input
                                type="text"
                                placeholder="Name on card"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{
                                    width: '100%', padding: '1rem 1.2rem', borderRadius: '16px',
                                    border: '1px solid var(--surface-border)', fontSize: '1rem', outline: 'none', background: '#fcfdfc', color: 'var(--text-main)',
                                    fontWeight: '500', transition: 'all 0.3s'
                                }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginLeft: '4px' }}>Card Number</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    style={{
                                        width: '100%', padding: '1rem 1.2rem 1rem 3rem', borderRadius: '16px',
                                        border: '1px solid var(--surface-border)', fontSize: '1.1rem', outline: 'none', background: '#fcfdfc', color: 'var(--text-main)',
                                        fontFamily: 'monospace', fontWeight: '600', transition: 'all 0.3s'
                                    }}
                                    required
                                />
                                <CreditCard size={20} color="var(--primary-color)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginLeft: '4px' }}>Expiry Date</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={expiry}
                                    onChange={handleExpiryChange}
                                    style={{
                                        width: '100%', padding: '1rem', borderRadius: '16px',
                                        border: '1px solid var(--surface-border)', fontSize: '1.1rem', outline: 'none', background: '#fcfdfc', color: 'var(--text-main)',
                                        fontFamily: 'monospace', textAlign: 'center', fontWeight: '600'
                                    }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginLeft: '4px' }}>CVV</label>
                                <input
                                    type="password"
                                    placeholder="***"
                                    value={cvv}
                                    onChange={handleCvvChange}
                                    style={{
                                        width: '100%', padding: '1rem', borderRadius: '16px',
                                        border: '1px solid var(--surface-border)', fontSize: '1.1rem', outline: 'none', background: '#fcfdfc', color: 'var(--text-main)',
                                        fontFamily: 'monospace', textAlign: 'center', letterSpacing: '4px', fontWeight: '600'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                            <ShieldCheck size={16} />
                            <span>Payments are secure and encrypted.</span>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1.2rem', marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: '800', borderRadius: '16px' }}
                        >
                            Pay Rs. {finalAmount.toLocaleString()}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default CardPaymentModal;
