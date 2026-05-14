const express = require('express');
const path = require('path');
require('dotenv').config();

const { ConnectToDatabase, ToObjectId, CloseDatabase } = require('./db');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Helper to build the query object for the GET /api/trades route

const BuildTradeQuery = (req) => {
  const filter = {};
  
  // This line ensures that even if req or req.query is missing, it won't crash
  const query = req?.query || {};

  if (query.symbol) {
    filter.symbol = query.symbol;
  }
  
  if (query.exchange) {
    filter.exchange = query.exchange;
  }

  return filter;
};

// Validator for POST and PUT requests [cite: 92]
function ValidateTrade(trade) {
  if (!trade.symbol || typeof trade.symbol !== 'string') {
    return 'Stock symbol is required (e.g., AAPL).';
  }
  if (typeof trade.price !== 'number' || trade.price < 0) {
    return 'Trade price must be a non-negative number.';
  }
  if (!Number.isInteger(trade.volume) || trade.volume < 0) {
    return 'Volume must be a non-negative integer.';
  }
  if (!trade.exchange || typeof trade.exchange !== 'string') {
    return 'Exchange (e.g., NASDAQ) is required.';
  }
  return null;
}

// API Routes

app.get('/api/health', async (request, response) => {
  const collection = await ConnectToDatabase();
  const count = await collection.countDocuments();
  response.json({ status: 'ok', database: process.env.DB_NAME, records: count }); // [cite: 70]
});

app.get('/api/trades', async (req, res) => {
  // Pass the WHOLE req object
  const query = BuildTradeQuery(req); 
  
  // Use the connection method just like other routes
  const collection = await ConnectToDatabase();
  const trades = await collection.find(query).toArray();
  
  res.json(trades);
});

app.get('/api/trades/:id', async (request, response) => {
  const id = ToObjectId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Invalid ID format.' });

  const collection = await ConnectToDatabase();
  const trade = await collection.findOne({ _id: id });

  if (!trade) return response.status(404).json({ error: 'Trade not found.' });
  response.json(trade);
});

app.post('/api/trades', async (request, response) => {
  const trade = {
    symbol: String(request.body.symbol || '').toUpperCase(),
    price: Number(request.body.price),
    volume: Number(request.body.volume),
    exchange: String(request.body.exchange || '').toUpperCase()
  };

  const error = ValidateTrade(trade);
  if (error) return response.status(400).json({ error });

  const collection = await ConnectToDatabase();
  const result = await collection.insertOne(trade);
  response.status(201).json({ ...trade, _id: result.insertedId });
});

app.put('/api/trades/:id', async (request, response) => {
  const id = ToObjectId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Invalid ID format.' });

  // PUT requires a full replacement, so we build the whole object
  const trade = {
    symbol: String(request.body.symbol || '').toUpperCase(),
    price: Number(request.body.price),
    volume: Number(request.body.volume),
    exchange: String(request.body.exchange || '').toUpperCase()
  };

  // Validate to make sure no fields are missing
  const error = ValidateTrade(trade);
  if (error) return response.status(400).json({ error });

  const collection = await ConnectToDatabase();
  // Replace the entire document
  const result = await collection.findOneAndReplace(
    { _id: id },
    trade,
    { returnDocument: 'after' }
  );

  if (!result) return response.status(404).json({ error: 'Trade not found.' });
  response.json(result);
});

app.patch('/api/trades/:id', async (request, response) => {
  const id = ToObjectId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Invalid ID format.' });

  const updates = {};
  if (request.body.symbol) updates.symbol = request.body.symbol.toUpperCase();
  if (request.body.price !== undefined) updates.price = Number(request.body.price);
  if (request.body.volume !== undefined) updates.volume = Number(request.body.volume);
  if (request.body.exchange) updates.exchange = request.body.exchange.toUpperCase();

  const collection = await ConnectToDatabase();
  const result = await collection.findOneAndUpdate(
    { _id: id },
    { $set: updates },
    { returnDocument: 'after' }
  );

  if (!result) return response.status(404).json({ error: 'Trade not found.' });
  response.json(result);
});

app.delete('/api/trades/:id', async (request, response) => {
  const id = ToObjectId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Invalid ID format.' });

  const collection = await ConnectToDatabase();
  const result = await collection.deleteOne({ _id: id });

  if (result.deletedCount === 0) return response.status(404).json({ error: 'Trade not found.' });
  response.status(204).send();
});

// Error handling
app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: 'Internal Server Error.' });
});

const server = app.listen(port, () => {
  console.log(`Trade Engine API listening at http://localhost:${port}`);
});
