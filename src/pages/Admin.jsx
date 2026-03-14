import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Admin.css';

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'history'
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({ barcode: '', name: '', price: '', weight: '', discount: 0, stock: 0 });
    const [isEditing, setIsEditing] = useState(false);

    const navigate = useNavigate();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/products');
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/orders');
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError('Failed to fetch transaction history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            if (activeTab === 'inventory') {
                fetchProducts();
            } else {
                fetchOrders();
            }
        }
    }, [isAuthenticated, activeTab]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid Admin Password');
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        const url = isEditing
            ? `http://localhost:5000/api/products/${currentProduct.barcode}`
            : 'http://localhost:5000/api/products';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentProduct)
            });

            if (response.ok) {
                setIsModalOpen(false);
                setCurrentProduct({ barcode: '', name: '', price: '', weight: '', discount: 0, stock: 0 });
                fetchProducts();
            } else {
                const data = await response.json();
                setError(data.message || 'Error saving product');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const handleDeleteProduct = async (barcode) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/products/${barcode}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    fetchProducts();
                } else {
                    setError('Error deleting product');
                }
            } catch (err) {
                setError('Network error');
            }
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setIsEditing(true);
        } else {
            setCurrentProduct({ barcode: '', name: '', price: '', weight: '', discount: 0, stock: 0 });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-login-card"
                >
                    <h1>Admin Portal</h1>
                    <p>Please enter your secret password to continue</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            placeholder="Admin Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p className="error-text">{error}</p>}
                        <button type="submit" className="login-btn">Login</button>
                    </form>
                    <button onClick={() => navigate('/')} className="back-btn">Back to Store</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="header-info">
                    <h1>Management Hub</h1>
                    <div className="admin-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                            onClick={() => setActiveTab('inventory')}
                        >
                            Inventory
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            Sales History
                        </button>
                    </div>
                </div>
                <div className="header-actions">
                    {activeTab === 'inventory' && (
                        <button onClick={() => openModal()} className="add-btn">+ Add Product</button>
                    )}
                    <button onClick={() => setIsAuthenticated(false)} className="logout-btn">Logout</button>
                </div>
            </header>

            <main className="admin-content">
                {error && <div className="error-banner">{error}</div>}

                {activeTab === 'inventory' ? (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="product-table-container"
                    >
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Barcode</th>
                                    <th>Name</th>
                                    <th>Price (Rs)</th>
                                    <th>Weight (g)</th>
                                    <th>Discount (%)</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.barcode}>
                                        <td><code>{product.barcode}</code></td>
                                        <td>{product.name}</td>
                                        <td>{product.price.toFixed(2)}</td>
                                        <td>{product.weight}g</td>
                                        <td>{product.discount || 0}%</td>
                                        <td className={product.stock < 5 ? 'low-stock' : ''}>
                                            {product.stock || 0}
                                        </td>
                                        <td className="actions-cell">
                                            <button onClick={() => openModal(product)} className="edit-icon-btn">Edit</button>
                                            <button onClick={() => handleDeleteProduct(product.barcode)} className="delete-icon-btn">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {loading && <div className="loading-spinner">Loading inventory...</div>}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="history-container"
                    >
                        <div className="orders-list">
                            {orders.length === 0 && !loading && <p className="no-data">No transactions found.</p>}
                            {orders.map(order => (
                                <div key={order._id} className="order-card">
                                    <div className="order-summary">
                                        <div className="order-meta">
                                            <span className="order-date">
                                                {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="order-customer">{order.customerEmail}</span>
                                        </div>
                                        <div className="order-total">
                                            Rs {order.totalAmount.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="order-details">
                                        <table className="order-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Item</th>
                                                    <th>Price</th>
                                                    <th title="Quantity detected by weight sensor">Sensor Qty</th>
                                                    <th title="Quantity checked out by customer">Customer Qty</th>
                                                    <th>Subtotal</th>
                                                    <th>Verification</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item, idx) => {
                                                    const mismatch = (item.sensorQuantity || item.quantity) !== item.quantity;
                                                    return (
                                                        <tr key={idx} style={mismatch ? { background: '#fff1f0' } : {}}>
                                                            <td>{item.name}</td>
                                                            <td>{item.price.toFixed(2)}</td>
                                                            <td style={{ fontWeight: '600' }}>{item.sensorQuantity || item.quantity}</td>
                                                            <td style={{ fontWeight: '600' }}>{item.quantity}</td>
                                                            <td>{(item.price * item.quantity).toFixed(2)}</td>
                                                            <td style={{ fontWeight: '700' }}>
                                                                {mismatch ? (
                                                                    <span style={{ color: '#cf1322' }}>⚠️ Mismatch</span>
                                                                ) : (
                                                                    <span style={{ color: '#3d6a37' }}>✅ Matched</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {loading && <div className="loading-spinner">Loading sales history...</div>}
                    </motion.div>
                )}
            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                        >
                            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                            <form onSubmit={handleSaveProduct}>
                                <div className="form-group">
                                    <label>Barcode</label>
                                    <input
                                        type="text"
                                        value={currentProduct.barcode}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, barcode: e.target.value })}
                                        disabled={isEditing}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        value={currentProduct.name}
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group-row">
                                    <div className="form-group">
                                        <label>Price (Rs)</label>
                                        <input
                                            type="number"
                                            value={currentProduct.price}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Weight (g)</label>
                                        <input
                                            type="number"
                                            value={currentProduct.weight}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, weight: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Discount (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={currentProduct.discount}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, discount: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={currentProduct.stock}
                                            onChange={(e) => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) || 0 })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">Cancel</button>
                                    <button type="submit" className="save-btn">Save Product</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Admin;
