import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, PackagePlus, ArrowLeft, Trash2, Plus, Minus, Scale, RefreshCw } from 'lucide-react';
import BarcodeScanner from '../components/BarcodeScanner';
import CheckoutSummary from '../components/CheckoutSummary';

const Shopping = () => {
    const [items, setItems] = useState([]);
    const [showScanner, setShowScanner] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "Guest";

    // Calculate totals
    const totalAmount = useMemo(() =>
        items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        [items]);

    const expectedWeight = useMemo(() =>
        items.reduce((sum, item) => sum + (item.weight * item.quantity), 0),
        [items]);

    const resetScale = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch('http://localhost:5000/api/weight', { method: 'DELETE' });
            if (response.ok) {
                // Clear locally as well
                setItems([]);
                setTimeout(() => setIsSyncing(false), 500);
            }
        } catch (error) {
            console.error("Error resetting scale:", error);
            setIsSyncing(false);
        }
    };

    const handleScanSuccess = async (scannedBarcode) => {
        const barcode = scannedBarcode.trim();
        if (barcode === "error") {
            navigate('/error');
            return;
        }

        setIsSyncing(true);
        try {
            // 1. Fetch Product Data
            const response = await fetch(`http://localhost:5000/api/products/${barcode}`);
            if (!response.ok) {
                alert("Product not found in store database.");
                setIsSyncing(false);
                return;
            }
            const product = await response.json();

            // 2. Fetch Latest Sensor Weight
            const weightResponse = await fetch('http://localhost:5000/api/weight/latest');
            const weightData = await weightResponse.json();

            // Total weight reported by sensor (in kg converted to g)
            const currentTotalWeight = Number(weightData.weight) * 1000;

            // Calculate how much weight was added (Delta)
            const deltaWeight = currentTotalWeight - expectedWeight;

            // Calculate quantity based on weight (Background calculation for cashier)
            const unitWeight = product.weight;
            let sensorQty = Math.max(1, Math.round(deltaWeight / unitWeight));

            setTimeout(() => {
                setItems(prevItems => {
                    const existing = prevItems.find(i => i.barcode === product.barcode);
                    if (existing) {
                        return prevItems.map(i =>
                            i.barcode === product.barcode
                                ? {
                                    ...i,
                                    quantity: i.quantity + sensorQty,
                                    sensorQuantity: (i.sensorQuantity || i.quantity) + sensorQty
                                }
                                : i
                        );
                    } else {
                        return [...prevItems, {
                            ...product,
                            quantity: sensorQty,
                            sensorQuantity: sensorQty
                        }];
                    }
                });
                setIsSyncing(false);
            }, 500);

        } catch (error) {
            console.error("Error fetching product:", error);
            setIsSyncing(false);
            alert("Connection error fetching product data.");
        }
    };

    const updateQuantity = (barcode, change) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.barcode === barcode) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
            }
            return item;
        }));
    };

    const removeItem = (barcode) => {
        setItems(prevItems => prevItems.filter(item => item.barcode !== barcode));
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            style={{ padding: '2.5rem 1rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}
        >
            <div className="glass-panel animate-slide-up" style={{ padding: '0', overflow: 'hidden', border: 'none', background: 'rgba(255,255,255,0.95)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}>
                <div className="glass-header" style={{ padding: '1.75rem 2.5rem', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
                    <button className="btn-icon" onClick={() => navigate('/')} title="Go back">
                        <ArrowLeft size={22} />
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <h2 className="title-gradient" style={{ fontSize: '1.8rem', marginBottom: '4px', fontWeight: '900', letterSpacing: '-0.5px' }}>Smart Checkout</h2>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div className="status-dot pulse" />
                            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>{email}</p>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="btn-icon"
                            style={{ background: 'var(--primary-light)', cursor: 'default', width: '48px', height: '48px' }}
                        >
                            <ShoppingCart size={22} color="var(--primary-color)" />
                        </motion.div>
                        <motion.span
                            key={items.length}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                position: 'absolute', top: -4, right: -4,
                                background: 'var(--primary-color)', color: 'white',
                                width: '24px', height: '24px',
                                borderRadius: '10px', fontSize: '0.8rem', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontWeight: '900',
                                border: '3px solid white',
                                boxShadow: '0 4px 12px rgba(61, 106, 55, 0.3)'
                            }}
                        >
                            {items.length}
                        </motion.span>
                    </div>
                </div>

                <div style={{ padding: '3rem' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
                            <div style={{
                                width: '140px', height: '140px', background: '#f8faf9',
                                borderRadius: '40px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 2.5rem',
                                position: 'relative'
                            }}>
                                <PackagePlus size={60} style={{ color: 'var(--primary-color)', opacity: 0.3 }} />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    style={{ position: 'absolute', width: '100%', height: '100%', border: '2px dashed #e2e8f0', borderRadius: '40px' }}
                                />
                            </div>
                            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '800', color: '#1e293b' }}>Scan your first item</h3>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '350px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
                                Scan a product once, then use the <Plus size={16} /> and <Minus size={16} /> buttons to adjust the quantity.
                            </p>
                            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                                <button className="btn btn-primary" onClick={() => setShowScanner(true)} style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }}>
                                    <PackagePlus size={22} />
                                    Open Scanner
                                </button>
                                <button className="btn" style={{ background: '#f1f5f9', color: '#475569', padding: '1.2rem 2.5rem' }} onClick={resetScale}>
                                    <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                                    Synchronize Cart
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="shopping-table" style={{ marginTop: '0', width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                                <thead>
                                    <tr style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        <th style={{ width: '80px' }}></th>
                                        <th style={{ textAlign: 'left', paddingLeft: '1rem' }}>Product & Details</th>
                                        <th style={{ textAlign: 'center' }}>Quantity</th>
                                        <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {items.map(product => (
                                            <motion.tr
                                                key={product.barcode}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, x: -30 }}
                                                style={{
                                                    background: 'white',
                                                    borderRadius: '20px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <td style={{ paddingLeft: '1.5rem', borderRadius: '20px 0 0 20px' }}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1, background: '#fee2e2' }}
                                                        onClick={() => removeItem(product.barcode)}
                                                        className="btn-icon"
                                                        style={{ background: '#fff1f0', color: '#ef4444', borderRadius: '14px', width: '42px', height: '42px' }}
                                                    >
                                                        <Trash2 size={20} />
                                                    </motion.button>
                                                </td>
                                                <td style={{ padding: '1.5rem 1rem' }}>
                                                    <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b', marginBottom: '4px' }}>
                                                        {product.name}
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>
                                                        Rs. {Number(product.price).toLocaleString()} • {product.weight}g
                                                    </div>
                                                </td>
                                                <td align="center">
                                                    <div className="qty-controls" style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                                        <button className="qty-btn" onClick={() => updateQuantity(product.barcode, -1)} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                            <Minus size={16} strokeWidth={3} />
                                                        </button>
                                                        <span className="qty-value" style={{ fontSize: '1.2rem', minWidth: '40px', fontWeight: '800' }}>{product.quantity}</span>
                                                        <button className="qty-btn" onClick={() => updateQuantity(product.barcode, 1)} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                            <Plus size={16} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td align="right" style={{ paddingRight: '2rem', fontWeight: '900', fontSize: '1.3rem', color: '#1e293b', borderRadius: '0 20px 20px 0' }}>
                                                    <span style={{ fontSize: '0.9rem', color: '#94a3b8', marginRight: '4px' }}>Rs.</span>
                                                    {(product.price * product.quantity).toLocaleString()}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {items.length > 0 && (
                        <div style={{
                            marginTop: '4rem', padding: '2.5rem', background: '#f8fafc',
                            borderRadius: '32px', border: '1px solid #e2e8f0',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                            <div>
                                <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shopping Total</div>
                                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1.5px' }}>
                                    <span style={{ fontSize: '1.4rem', verticalAlign: 'middle', marginRight: '6px', color: '#94a3b8' }}>Rs.</span>
                                    {Number(totalAmount).toLocaleString()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="btn"
                                    style={{ background: 'white', color: '#475569', padding: '1.2rem 2.5rem', border: '1px solid #e2e8f0' }}
                                    onClick={resetScale}
                                >
                                    <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                                    Reset
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="btn"
                                    style={{ background: '#ecfdf5', color: '#059669', padding: '1.2rem 2.5rem', border: '1px solid #b7eb8f' }}
                                    onClick={() => setShowScanner(true)}
                                >
                                    <PackagePlus size={22} />
                                    Add Items
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn btn-primary"
                                    style={{ padding: '1.2rem 4rem', borderRadius: '22px', fontSize: '1.2rem', boxShadow: '0 10px 25px rgba(61, 106, 55, 0.3)' }}
                                    onClick={() => setShowSummary(true)}
                                >
                                    Checkout
                                </motion.button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Syncing Overlay */}
            <AnimatePresence>
                {isSyncing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 2000
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <RefreshCw size={48} className="animate-spin" color="var(--primary-color)" />
                            <p style={{ marginTop: '1rem', fontWeight: '800', color: '#1a331a' }}>Synchronizing...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scanner Modal */}
            {showScanner && (
                <BarcodeScanner onClose={() => setShowScanner(false)} onScanSuccess={handleScanSuccess} />
            )}

            {/* Checkout Summary Modal */}
            {showSummary && (
                <CheckoutSummary
                    onClose={() => setShowSummary(false)}
                    totalAmount={totalAmount}
                    customerEmail={email}
                    items={items}
                />
            )}
        </motion.div>
    );
};

export default Shopping;
