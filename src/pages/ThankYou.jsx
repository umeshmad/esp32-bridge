import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Mail, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ThankYou = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Grab the customer email passed from previous screens (if available)
    const initialEmail = location.state?.email || "";

    const [emailStatus, setEmailStatus] = useState('idle'); // 'idle', 'sending', 'success', 'error'
    const [inputValue, setInputValue] = useState(initialEmail);
    const [secondsLeft, setSecondsLeft] = useState(15);

    const controls = useAnimation();

    useEffect(() => {
        // Prevent users from using the browser back button to return to checkout
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        window.addEventListener('popstate', handlePopState);

        // Start checkmark drawing animation
        controls.start("visible");

        // Automatic redirection timer
        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/', { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            clearInterval(timer);
        };
    }, [controls, navigate]);

    const handleSendEmail = async () => {
        if (!inputValue || !inputValue.includes('@')) {
            setEmailStatus('error');
            return;
        }

        setEmailStatus('sending');

        try {
            const response = await fetch('http://localhost:5000/api/send-bill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inputValue })
            });

            if (response.ok) {
                setEmailStatus('success');
                // Option B: Redirect after 3 seconds of showing success
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 3000);
            } else {
                const data = await response.json();
                console.error("Email sending failure:", data.message);
                setEmailStatus('error');
            }
        } catch (err) {
            console.error("Email sending network error:", err);
            setEmailStatus('error');
        }
    };

    const handleFinish = () => {
        // Reset session logic could go here
        navigate('/', { replace: true });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end))',
                padding: '2rem 1.5rem',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div className="glass-panel" style={{ padding: '3.5rem 2rem', width: '100%', maxWidth: '450px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative Soft Background Blob */}
                <div style={{
                    position: 'absolute', top: '-10%', left: '-10%', width: '120px', height: '120px',
                    background: 'var(--primary-light)', filter: 'blur(35px)', borderRadius: '50%', zIndex: -1, opacity: 0.5
                }} />

                {/* Error Banner */}
                <AnimatePresence>
                    {emailStatus === 'error' && (
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            style={{
                                position: 'absolute', top: 0, left: 0, right: 0,
                                background: '#fff5f5', color: '#d32f2f', padding: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '0.5rem', borderBottom: '1px solid #ffe3e3', fontWeight: '600', fontSize: '0.9rem'
                            }}
                        >
                            <AlertCircle size={18} />
                            <span>Failed to send email. Please try again.</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Top Section */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                        style={{
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                            width: '110px',
                            height: '110px',
                            borderRadius: '32px',
                            background: 'var(--primary-light)',
                            boxShadow: '0 15px 35px rgba(61, 106, 55, 0.1)'
                        }}
                    >
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <motion.path
                                d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
                                stroke="var(--primary-color)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={controls}
                                variants={{
                                    visible: { pathLength: 1, transition: { duration: 1, ease: "easeOut", delay: 0.2 } }
                                }}
                            />
                            <motion.path
                                d="M22 4L12 14.01L9 11.01"
                                stroke="var(--primary-color)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={controls}
                                variants={{
                                    visible: { pathLength: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.8 } }
                                }}
                            />
                        </svg>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="title-gradient"
                        style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.75rem' }}
                    >
                        Success!
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '500' }}
                    >
                        Payment confirmed & verified.
                    </motion.p>
                </div>

                {/* Middle Section */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.7 }}
                    style={{
                        background: '#f8faf8',
                        borderRadius: '24px',
                        padding: '1.75rem',
                        width: '100%',
                        border: '1px solid var(--surface-border)',
                        marginBottom: '3rem',
                        textAlign: 'left'
                    }}
                >
                    <div style={{
                        fontSize: '1.05rem',
                        fontWeight: '700',
                        color: 'var(--primary-color)',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Mail size={20} />
                        Digital Receipt
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                        Your itemized bill will be sent to the email address below.
                    </p>

                    {emailStatus === 'success' ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: 'var(--success)',
                                fontWeight: '700',
                                background: '#e8f5e9',
                                padding: '1.2rem',
                                borderRadius: '16px',
                                border: '1px solid #c8e6c9'
                            }}
                        >
                            <ShieldCheck size={22} />
                            <span>Sent to {inputValue}!</span>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="input-field"
                                    style={{
                                        width: '100%',
                                        padding: '1.1rem 1.2rem',
                                        borderRadius: '16px',
                                        border: '2px solid transparent',
                                        fontSize: '1.05rem',
                                        background: 'white',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                    }}
                                />
                            </div>

                            <button
                                onClick={handleSendEmail}
                                disabled={emailStatus === 'sending'}
                                className="btn"
                                style={{
                                    width: '100%',
                                    background: emailStatus === 'sending' ? '#f1f1f1' : 'var(--primary-color)',
                                    color: emailStatus === 'sending' ? '#999' : 'white',
                                    padding: '1.1rem',
                                    borderRadius: '16px',
                                    fontSize: '1.05rem',
                                    fontWeight: '700',
                                    boxShadow: emailStatus === 'sending' ? 'none' : '0 10px 20px rgba(61, 106, 55, 0.15)'
                                }}
                            >
                                {emailStatus === 'sending' ? 'Sending...' : 'E-mail My Bill'}
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Bottom Section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    style={{ width: '100%' }}
                >
                    <button
                        onClick={handleFinish}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            borderRadius: '20px',
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            letterSpacing: '0.02em'
                        }}
                    >
                        Done
                    </button>

                    <button
                        onClick={handleFinish}
                        style={{
                            marginTop: '1rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            opacity: 0.7
                        }}
                    >
                        Back to Start ({secondsLeft}s)
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ThankYou;
