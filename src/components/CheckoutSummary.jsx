import { motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CardPaymentModal from './CardPaymentModal';

const CheckoutSummary = ({ onClose, totalAmount, customerEmail, items }) => {
    const navigate = useNavigate();
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Example: 10% discount logic
    const discount = totalAmount * 0.1;
    const finalAmount = totalAmount - discount;

    const handlePayment = () => {
        setShowPaymentModal(true);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(61, 106, 55, 0.2)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '1.5rem'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '3rem 2.5rem',
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid var(--primary-light)',
                    boxShadow: '0 25px 50px -12px rgba(61, 106, 55, 0.25)'
                }}
            >
                <button
                    onClick={onClose}
                    className="btn-icon"
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f8faf8' }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '70px', height: '70px', background: 'var(--primary-light)',
                        borderRadius: '20px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 1.5rem'
                    }}>
                        <CheckCircle2 size={36} color="var(--primary-color)" strokeWidth={2.5} />
                    </div>
                    <h2 className="title-gradient" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Order Summary</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>Review your items before payment</p>
                </div>

                <div style={{
                    background: '#f8faf8',
                    padding: '1.75rem',
                    borderRadius: '20px',
                    marginBottom: '2.5rem',
                    border: '1px solid #edf2ed'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Cart Subtotal</span>
                        <span style={{ fontWeight: '700', color: '#1a331a' }}>Rs. {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Special Discount</span>
                        <span style={{ fontWeight: '700', color: 'var(--success)' }}>- Rs. {discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div style={{ height: '1px', background: '#e0ece0', margin: '1.5rem 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1a331a' }}>Total Amount</span>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary-color)', letterSpacing: '-0.02em' }}>
                                <span style={{ fontSize: '1rem', marginRight: '4px' }}>Rs.</span>
                                {finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', borderRadius: '18px' }}
                        onClick={handlePayment}
                    >
                        Secure Payment
                    </button>

                    <button
                        className="btn"
                        style={{
                            width: '100%', padding: '1rem', background: 'transparent',
                            color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.95rem'
                        }}
                        onClick={onClose}
                    >
                        Back to Cart
                    </button>
                </div>
            </motion.div>

            {/* Simulated Payment Gateway Modal */}
            {showPaymentModal && (
                <CardPaymentModal
                    onClose={() => setShowPaymentModal(false)}
                    finalAmount={finalAmount}
                    customerEmail={customerEmail}
                    items={items}
                />
            )}
        </div>
    );
};

export default CheckoutSummary;
