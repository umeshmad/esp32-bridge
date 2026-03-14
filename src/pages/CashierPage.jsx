import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, CheckCircle2, AlertTriangle,
    ArrowRight, ShoppingBag, Clock, DollarSign,
    User, Mail, Phone, MapPin, ChevronRight, X
} from 'lucide-react';

const CashierPage = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let result = orders;
        if (searchTerm) {
            result = result.filter(o =>
                o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o._id.toString().includes(searchTerm)
            );
        }
        if (statusFilter !== 'all') {
            result = result.filter(o => {
                const isMismatch = o.items.some(item => (item.sensorQuantity || item.quantity) !== item.quantity);
                return statusFilter === 'mismatch' ? isMismatch : !isMismatch;
            });
        }
        setFilteredOrders(result);
    }, [searchTerm, statusFilter, orders]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/orders');
            const data = await response.json();
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const getStatusInfo = (order) => {
        const hasMismatch = order.items.some(item => (item.sensorQuantity || item.quantity) !== item.quantity);
        return hasMismatch ? {
            label: 'Weight Mismatch',
            color: '#ef4444',
            bg: '#fef2f2',
            icon: <AlertTriangle size={14} />
        } : {
            label: 'Verified',
            color: 'var(--success)',
            bg: '#f0fdf4',
            icon: <CheckCircle2 size={14} />
        };
    };

    return (
        <div style={{ padding: '2rem', minHeight: '100vh', background: '#f8fafc' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>Cashier Portal</h1>
                        <p style={{ color: '#64748b', fontWeight: '500' }}>Monitor and verify real-time checkout transactions</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                            background: 'white', borderRadius: '16px', padding: '0.75rem 1.25rem',
                            display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}>
                            <Search size={20} color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', outline: 'none', fontWeight: '500', minWidth: '250px' }}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                background: 'white', borderRadius: '16px', padding: '0.75rem 1.25rem',
                                border: '1px solid #e2e8f0', fontWeight: '600', color: '#1e293b',
                                outline: 'none', cursor: 'pointer'
                            }}
                        >
                            <option value="all">All Transactions</option>
                            <option value="verified">Verified Only</option>
                            <option value="mismatch">Mismatches</option>
                        </select>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'white', border: '1px solid #e2e8f0', minHeight: '600px' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '10rem' }}>Loading transactions...</div>
                        ) : filteredOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '10rem' }}>No orders found match your criteria.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>
                                        <th style={{ padding: '0 1.5rem 1rem' }}>Order ID</th>
                                        <th style={{ padding: '0 1rem 1rem' }}>Customer</th>
                                        <th style={{ padding: '0 1rem 1rem', textAlign: 'center' }}>Sensor Count</th>
                                        <th style={{ padding: '0 1rem 1rem', textAlign: 'center' }}>Scanned Qty</th>
                                        <th style={{ padding: '0 1rem 1rem', textAlign: 'right' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(order => {
                                        const status = getStatusInfo(order);
                                        return (
                                            <motion.tr
                                                key={order._id}
                                                layoutId={order._id}
                                                onClick={() => setSelectedOrder(order)}
                                                style={{
                                                    background: selectedOrder?._id === order._id ? '#f1f5f9' : 'white',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                className="cashier-row"
                                            >
                                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700', borderRadius: '16px 0 0 16px' }}>#{order._id.toString().slice(-6).toUpperCase()}</td>
                                                <td style={{ padding: '1.25rem 1rem' }}>
                                                    <div style={{ fontWeight: '600', color: '#334155' }}>{order.customerEmail}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(order.date).toLocaleString()}</div>
                                                </td>
                                                <td style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: '700' }}>
                                                    {order.items.reduce((sum, i) => sum + (i.sensorQuantity || i.quantity), 0)}
                                                </td>
                                                <td style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: '800', color: 'var(--primary-color)' }}>
                                                    {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                                                </td>
                                                <td style={{ padding: '1.25rem 1rem' }}>
                                                    <span style={{
                                                        padding: '0.4rem 0.8rem', borderRadius: '99px', fontSize: '0.75rem',
                                                        fontWeight: '700', background: status.bg, color: status.color,
                                                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                                                    }}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', borderRadius: '0 16px 16px 0' }}>
                                                    <ChevronRight size={18} color="#94a3b8" />
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div style={{ position: 'sticky', top: '2rem' }}>
                        <AnimatePresence mode="wait">
                            {selectedOrder ? (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-panel"
                                    style={{ padding: '2rem', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Transaction Details</h3>
                                        <button onClick={() => setSelectedOrder(null)} style={{ color: '#94a3b8' }}><X size={20} /></button>
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={20} color="var(--primary-color)" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Customer Email</div>
                                                <div style={{ fontWeight: '700' }}>{selectedOrder.customerEmail}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Clock size={20} color="var(--primary-color)" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Checkout Time</div>
                                                <div style={{ fontWeight: '700' }}>{new Date(selectedOrder.date).toLocaleTimeString()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items Purchased</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                                <div>
                                                    <div style={{ fontWeight: '700' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        Sensor: {item.sensorQuantity || item.quantity} • Scanned: {item.quantity}
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: '700' }}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>Grand Total</span>
                                        <span style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--primary-color)' }}>Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1rem' }}
                                        onClick={() => {
                                            alert('Order status updated. Transaction closed.');
                                            setSelectedOrder(null);
                                        }}
                                    >
                                        Mark as Verified
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="glass-panel"
                                    style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8', background: 'white', border: '1px solid #e2e8f0', borderStyle: 'dashed' }}
                                >
                                    <ShoppingBag size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                                    <p style={{ fontWeight: '500' }}>Select a transaction from the list to view its real-time weight verification details.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashierPage;
