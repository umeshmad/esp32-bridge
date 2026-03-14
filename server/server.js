require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const transporter = require('./config/mail');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection String (Aiven MySQL)
const MYSQL_URL = "mysql://avnadmin:AVNS_9lfAC-xMtEPNzCoxA2V@mysql-1a096aad-umeshmaduwantha284-89ef.a.aivencloud.com:15979/defaultdb?ssl-mode=REQUIRED";

let pool;

async function initDB() {
    try {
        pool = mysql.createPool(MYSQL_URL);
        console.log('Successfully connected to Aiven MySQL!');

        // --- Create Tables ---

        // Products Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                barcode VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                weight INT NOT NULL,
                discount DECIMAL(5, 2) DEFAULT 0,
                stock INT DEFAULT 0
            )
        `);

        // Orders Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customerEmail VARCHAR(255) NOT NULL,
                totalAmount DECIMAL(10, 2) NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Order Items Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                orderId INT,
                barcode VARCHAR(50),
                name VARCHAR(255),
                price DECIMAL(10, 2),
                quantity INT,
                sensorQuantity INT,
                FOREIGN KEY (orderId) REFERENCES orders(id)
            )
        `);

        // Carts Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS carts (
                cartId VARCHAR(50) PRIMARY KEY,
                isRegistered BOOLEAN DEFAULT TRUE,
                dateRegistered TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Weights Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS weights (
                id INT AUTO_INCREMENT PRIMARY KEY,
                weight DECIMAL(10, 3) NOT NULL,
                cartId VARCHAR(50) DEFAULT 'cart_001',
                unit VARCHAR(10) DEFAULT 'kg',
                timestamp BIGINT NOT NULL
            )
        `);

        console.log('Database tables verified/created.');

        // --- Auto-Seed Products if Empty ---
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM products');
        if (rows[0].count === 0) {
            const seedProducts = [
                ['8901234567890', 'Premium Ground Coffee', 1500, 250, 0, 50],
                ['4901234567891', 'Organic Almond Milk', 850, 1000, 0, 50],
                ['5901234567892', 'Whole Wheat Bread', 450, 400, 0, 50],
                ['6901234567893', 'Fresh Apples (1kg)', 1200, 1000, 0, 50],
                ['7901234567894', 'Dark Chocolate 70%', 900, 100, 0, 50],
                ['12345', 'Test Product 1', 100, 50, 0, 100],
                ['54321', 'Test Product 2', 200, 150, 0, 100],
                ['5901234123457', 'Samaposha', 200, 200, 0, 50],
                ['4006381333931', 'Cereal Multi-Grain', 850, 500, 0, 50],
                ['8710398519306', 'Milk Biscuits Pack', 120, 150, 0, 50]
            ];
            await pool.query('INSERT INTO products (barcode, name, price, weight, discount, stock) VALUES ?', [seedProducts]);
            console.log('Database seeded with initial products.');
        }

        // --- Auto-Seed Carts if Empty ---
        const [cartRows] = await pool.query('SELECT COUNT(*) as count FROM carts');
        if (cartRows[0].count === 0) {
            await pool.query('INSERT INTO carts (cartId) VALUES (?), (?), (?)', ['cart 1', 'cart 2', 'CART_1']);
            console.log('Carts seeded successfully.');
        }

    } catch (error) {
        console.error('Database initialization error:', error.message);
        process.exit(1);
    }
}

initDB();

// --- API Routes ---

// GET: Fetch a product by barcode
app.get('/api/products/:barcode', async (req, res) => {
    try {
        const barcode = req.params.barcode.trim();
        const [rows] = await pool.query('SELECT * FROM products WHERE barcode = ?', [barcode]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST: Save a new completed order
app.post('/api/orders', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { items, customerEmail, totalAmount } = req.body;

        // 1. Insert into orders table
        const [orderResult] = await connection.query(
            'INSERT INTO orders (customerEmail, totalAmount) VALUES (?, ?)',
            [customerEmail, totalAmount]
        );
        const orderId = orderResult.insertId;

        // 2. Insert items and update stock
        for (const item of items) {
            await connection.query(
                'INSERT INTO order_items (orderId, barcode, name, price, quantity, sensorQuantity) VALUES (?, ?, ?, ?, ?, ?)',
                [orderId, item.barcode, item.name, item.price, item.quantity, item.sensorQuantity || item.quantity]
            );

            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE barcode = ?',
                [item.quantity, item.barcode]
            );
        }

        await connection.commit();
        res.status(201).json({ id: orderId, ...req.body });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server error saving order', error: error.message });
    } finally {
        connection.release();
    }
});

// GET: Verify if a cart is registered
app.get('/api/carts/:cartId', async (req, res) => {
    try {
        const cartId = req.params.cartId.trim();
        const [rows] = await pool.query('SELECT * FROM carts WHERE cartId = ?', [cartId]);

        if (rows.length > 0) {
            res.json({ registered: true, cartId: rows[0].cartId });
        } else {
            // Check case-insensitive as well
            const [ciRows] = await pool.query('SELECT * FROM carts WHERE UPPER(cartId) = UPPER(?)', [cartId]);
            if (ciRows.length > 0) {
                res.json({ registered: true, cartId: ciRows[0].cartId });
            } else {
                res.status(404).json({ registered: false, message: 'Cart not registered' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- Weight Sensor API Routes ---

// GET: Fetch the latest weight from the sensor
app.get('/api/weight/latest', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM weights ORDER BY timestamp DESC LIMIT 1');
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json({ weight: 0, unit: 'kg', timestamp: Date.now() });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE: Clear weight history (Reset Scale)
app.delete('/api/weight', async (req, res) => {
    try {
        await pool.query('DELETE FROM weights');
        res.json({ message: 'Weight history cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST: External endpoint for ESP32 to push weight (Matches Arduino /weights)
app.post('/weights', async (req, res) => {
    try {
        const apiKey = req.headers['api-key'];
        if (apiKey !== 'myshop-2024') {
            return res.status(401).json({ success: false, message: 'Invalid API Key' });
        }

        const { weight, cartId, unit } = req.body;
        await pool.query(
            'INSERT INTO weights (weight, cartId, unit, timestamp) VALUES (?, ?, ?, ?)',
            [weight, cartId || 'cart_001', unit || 'kg', Date.now()]
        );
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- Admin API Routes ---

// GET: Fetch all products
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST: Create a new product
app.post('/api/products', async (req, res) => {
    try {
        const { barcode, name, price, weight, discount, stock } = req.body;
        await pool.query(
            'INSERT INTO products (barcode, name, price, weight, discount, stock) VALUES (?, ?, ?, ?, ?, ?)',
            [barcode, name, price, weight, discount || 0, stock || 0]
        );
        res.status(201).json(req.body);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating product', error: error.message });
    }
});

// PUT: Update an existing product
app.put('/api/products/:barcode', async (req, res) => {
    try {
        const barcode = req.params.barcode;
        const { name, price, weight, discount, stock } = req.body;
        await pool.query(
            'UPDATE products SET name=?, price=?, weight=?, discount=?, stock=? WHERE barcode=?',
            [name, price, weight, discount, stock, barcode]
        );
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE: Remove a product
app.delete('/api/products/:barcode', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE barcode = ?', [req.params.barcode]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET: Fetch all orders (Transaction History)
app.get('/api/orders', async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY date DESC');

        // Enrich orders with items
        for (let order of orders) {
            const [items] = await pool.query('SELECT * FROM order_items WHERE orderId = ?', [order.id]);
            order.items = items;
            // Map MongoDB-style _id for frontend compatibility if needed
            order._id = order.id;
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching orders', error: error.message });
    }
});

// POST: Send an email bill
app.post('/api/send-bill', async (req, res) => {
    const { email } = req.body;
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE customerEmail = ? ORDER BY date DESC LIMIT 1', [email]);
        if (orders.length === 0) return res.status(404).json({ message: 'No order found' });

        const order = orders[0];
        const [items] = await pool.query('SELECT * FROM order_items WHERE orderId = ?', [order.id]);

        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${Number(item.price).toLocaleString()}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"Shopping Time" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Shopping Time - Your Bill (Order #${order.id})`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                    <h2>Shopping Time Receipt</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead><tr style="background: #f8faf8;"><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                        <tbody>${itemsHtml}</tbody>
                        <tfoot><tr><td colspan="3" align="right"><b>Grand Total:</b></td><td align="right"><b>Rs. ${Number(order.totalAmount).toLocaleString()}</b></td></tr></tfoot>
                    </table>
                </div>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
