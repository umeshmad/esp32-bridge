const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

// ⚠️ Replace this with your actual MongoDB connection string from Atlas
const MONGO_URI = "mongodb+srv://<username>:<password>@shoppingtime.xxxxx.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "shoppingtime";
const COLLECTION = "weights";

// Optional: simple API key protection (match this in your ESP32 code)
const API_KEY = "my-esp32-secret-key";

let client;

async function getDB() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
}

// Health check
app.get('/', (req, res) => {
  res.json({ status: "ESP32 MongoDB Bridge is running!" });
});

// ✅ This mimics the old MongoDB Data API format your ESP32 already uses
app.post('/app/data-/endpoint/data/v1/action/insertOne', async (req, res) => {
  const apiKey = req.headers['api-key'];
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { document } = req.body;
    if (!document) return res.status(400).json({ error: "Missing document" });

    document.serverTimestamp = new Date(); // add real timestamp too

    const db = await getDB();
    const result = await db.collection(COLLECTION).insertOne(document);

    res.status(201).json({ insertedId: result.insertedId });
    console.log(`✓ Weight saved: ${document.weight} kg`);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET latest weights (bonus endpoint)
app.get('/weights', async (req, res) => {
  try {
    const db = await getDB();
    const data = await db.collection(COLLECTION)
      .find()
      .sort({ _id: -1 })
      .limit(20)
      .toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
