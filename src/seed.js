const { MongoClient, ConnectionCheckOutFailedEvent } = require('mongodb');
require('dotenv').config();

// Pull configuration from .env file
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "quantDB";

async function seedDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Successfully connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection('trades');

    // 1. Wipe the existing collection to start fresh
    await collection.deleteMany({});
    console.log("Cleared existing trade records.");

    // 2. Define 4-field data model
    const initialTrades = [
      { symbol: "AAPL", price: 175.50, volume: 10000, exchange: "NASDAQ" },
      { symbol: "TSLA", price: 210.25, volume: 5000, exchange: "NASDAQ" },
      { symbol: "JPM", price: 145.80, volume: 12000, exchange: "NYSE" },
      { symbol: "GS", price: 380.00, volume: 2500, exchange: "NYSE" },
      { symbol: "NVDA", price: 850.10, volume: 15000, exchange: "NASDAQ" }
    ];
    
    // 3. Insert test data into the database
    const result = await collection.insertMany(initialTrades);
    console.log(`${result.insertedCount} trade records successfully seeded!`);

  } catch (err) {
    console.error("Error seeding the database:", err);
  } finally {
    // 4. Always close the connection
    await client.close();
  }
}

seedDatabase();
