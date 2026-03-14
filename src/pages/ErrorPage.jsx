import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ErrorPage = () => {
    const [timeLeft, setTimeLeft] = useState(60);
    const navigate = useNavigate();

    useEffect(() => {
        if (timeLeft === 0) {
            navigate(-1);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, navigate]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container flex-center"
            style={{ minHeight: '100vh' }}
        >
            <div className="glass-panel error-state" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <div className="flex-center" style={{
                    width: '80px', height: '80px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    borderRadius: '50%',
                    margin: '0 auto 1.5rem',
                }}>
                    <AlertTriangle size={40} color="var(--danger)" />
                </div>

                <h1 style={{ color: 'var(--danger)', fontSize: '2rem', marginBottom: '1rem' }}>ERROR</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                    Barcode unreadable or incorrect product quantity. Please wait to retry.
                </p>

                <div style={{ fontSize: '3rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                    {String(timeLeft % 60).padStart(2, '0')}
                </div>
            </div>
        </motion.div>
    );
};

export default ErrorPage;
