const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "shoppingtime";
const COLLECTION = "weights";
const API_KEY = "e71c02db-857c-4147-a10c-1adf901f3e7d";

let client;

async function getDB() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("Connected to MongoDB!");
  }
  return client.db(DB_NAME);
}

app.get('/', (req, res) => {
  res.json({ status: "ESP32 Bridge is running!" });
});

app.post('/app/data-/endpoint/data/v1/action/insertOne', async (req, res) => {
  const key = req.headers['api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { document } = req.body;
    if (!document) return res.status(400).json({ error: "Missing document" });
    document.serverTimestamp = new Date();
    const db = await getDB();
    const result = await db.collection(COLLECTION).insertOne(document);
    console.log(`Weight saved: ${document.weight} kg`);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Use Railway's PORT environment variable
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
