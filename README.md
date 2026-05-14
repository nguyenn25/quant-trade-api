# Quantitative Trade Engine API — Node + Express + MongoDB

This project uses a custom data structure to represent quantitative financial trades within a Dev Container environment:

```js
{ "symbol": "AAPL", "price": 150.50, "volume": 1000, "exchange": "NASDAQ" }
```

The database connection is configured through `.env`:

```bash
MONGODB_URI=mongodb://db:27017
DB_NAME=quantDB
COLLECTION_NAME=trades
PORT=3000
```

## Run in VS Code Dev Containers

1. Open this folder in VS Code.
2. Choose **Reopen in Container**.
3. After the container finishes building, run:

```bash
npm run seed
npm run dev
```

Open:

```text
http://localhost:3000
```

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Check API and database connection |
| GET | `/api/trades` | List all trades |
| GET | `/api/trades?symbol=AAPL` | Filter trades by stock symbol |
| GET | `/api/trades?exchange=NASDAQ` | Filter trades by exchange |
| GET | `/api/trades/:id` | Get one specific trade |
| POST | `/api/trades` | Create a new trade record |
| PUT | `/api/trades/:id` | Replace a trade |
| PATCH | `/api/trades/:id` | Partially update a trade (e.g., update price) |
| DELETE | `/api/trades/:id` | Delete a trade |

## Example POST

```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -d '{"symbol":"MSFT","price":400.99,"volume":500,"exchange":"NASDAQ"}'
```

## Example Queries

```bash
curl http://localhost:3000/api/trades
curl "http://localhost:3000/api/trades?symbol=AAPL"
curl "http://localhost:3000/api/trades?exchange=NYSE"
```

## Questions
1. What is the purpose of using `.env`
It's basically a place to hide stuff like database passwords and connection strings so they don't end up public on GitHub. It's also super helpful because we can change variables depending on if we're running the app locally or on a live server without having to touch the actual code.
2. How does this work:
```js
if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
}
```
This code just checks if the user put a minPrice or maxPrice in the URL. If they did, it sets up a filter for the database. $gte stands for greater than or equal to, and $lte means less than or equal to. It turns the url strings into numbers and tells MongoDB to only grab items that fit inside that price range.
3. What is the program `seed.js` used for?
It's a script that wipes the current database collection and fills it with some starter dummy data (like the 5 trades). It just saves time so we don't have to manually type out and create records one by one just to test if our GET routes are working.
4. Try all API routes using Postman
(Screenshots of Postman operations testing all API routes)

*(Screenshots of Postman operations testing all API routes)*

**GET /api/health**
![Health Check](<Health Check.png>)

**GET /api/trades** (Get all)
![Get All Trades](<Read All Trades.png>)

**GET /api/trades?symbol=AAPL** (Filter by Symbol)
![Filter Symbol](<Filter by Symbol.png>)

**GET /api/trades?exchange=NASDAQ** (Filter by Exchange)
![Filter Exchange](<Filter by Exchange.png>)

**GET /api/trades/:id** (Get One)
![Get One Trade](<Get One Trade by ID.png>)

**POST /api/trades** (Create)
![Create Trade](<Create a Trade.png>)

**PUT /api/trades/:id** (Replace)
![Replace Trade](<PUT (Replace a Trade).png>)

**PATCH /api/trades/:id** (Update)
![Update Trade](<Update a Trade.png>)

**DELETE /api/trades/:id** (Delete)
![Delete Trade](<Delete a Trade.png>)
5. In terms of code what is the difference between `put` and `patch`
PUT replaces the entire object. If you try to PUT a new price but forget to include the stock symbol in the request, it just wipes the symbol out. PATCH is for partial updates. If you PATCH the price, it only changes the price and leaves the rest of the data exactly how it was.

