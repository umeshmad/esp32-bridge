const express = require("express");
const mysql   = require("mysql2/promise");
const app     = express();
app.use(express.json());

const pool = mysql.createPool({
  host:     process.env.MYSQLHOST     || "localhost",
  port:     process.env.MYSQLPORT     || 3306,
  user:     process.env.MYSQLUSER     || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "shoppingtime",
  waitForConnections: true,
  connectionLimit: 10,
});

async function initDB() {
  const conn = await pool.getConnection();
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS weights (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      weight     FLOAT       NOT NULL,
      cart_id    VARCHAR(50) NOT NULL DEFAULT 'cart_001',
      created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
    )
  `);
  conn.release();
  console.log("✅ Table 'weights' ready.");
}

// API key check
const API_KEY = process.env.API_KEY || "my-secret-key";
function auth(req, res, next) {
  if (req.headers["api-key"] !== API_KEY)
    return res.status(401).json({ error: "Unauthorized" });
  next();
}

// POST /weights  →  insert weight + cartId
app.post("/weights", auth, async (req, res) => {
  try {
    const { weight, cartId = "cart_001" } = req.body;
    if (weight === undefined || weight === null)
      return res.status(400).json({ error: "Missing 'weight' field" });

    const [result] = await pool.execute(
      "INSERT INTO weights (weight, cart_id) VALUES (?, ?)",
      [weight, cartId]
    );
    console.log(`✅ weight=${weight} kg  cartId=${cartId}  id=${result.insertId}`);
    res.status(201).json({ insertedId: result.insertId });
  } catch (err) {
    console.error("❌ DB error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /weights?limit=20
app.get("/weights", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const [rows] = await pool.execute(
      "SELECT * FROM weights ORDER BY id DESC LIMIT ?", [limit]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initDB();
  console.log(`🚀 Bridge running on port ${PORT}`);
});
