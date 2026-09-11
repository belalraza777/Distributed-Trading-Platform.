# Market Data Service

Base URL:

```bash
http://localhost:3000/api/market-data
```

---

# 1. Get All Stocks

## Endpoint

```http
GET /api/market-data
```

## Example

```bash
GET http://localhost:3000/api/market-data
```

---

# 2. Search Stocks

Search by stock symbol or company name.

## Endpoint

```http
GET /api/market-data/search?q=apple
```

## Example

```bash
GET http://localhost:3000/api/market-data/search?q=tesla
```

---

# 3. Get Stock By Symbol

## Endpoint

```http
GET /api/market-data/:symbol
```

## Example

```bash
GET http://localhost:3000/api/market-data/AAPL
```

---

# 4. Create Stock

Create a new stock entry.

## Endpoint

```http
POST /api/market-data
```

## Headers

```http
Content-Type: application/json
```

## Request Body

```json
{
  "symbol": "AAPL",
  "company_name": "Apple Inc.",
  "exchange": "NASDAQ"
}
```

## Example

```bash
POST http://localhost:3000/api/market-data
```

## Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "symbol": "AAPL",
    "company_name": "Apple Inc.",
    "exchange": "NASDAQ"
  }
}
```

---

# 5. Update Stock

Update stock information.

## Endpoint

```http
PUT /api/market-data/:id
```

## Example

```bash
PUT http://localhost:3000/api/market-data/1
```

## Request Body

```json
{
  "company_name": "Apple Technologies",
  "exchange": "NASDAQ"
}
```

---

# 6. Delete Stock

Delete a stock.

## Endpoint

```http
DELETE /api/market-data/:id
```

## Example

```bash
DELETE http://localhost:3000/api/market-data/1
```

---

# 7. Record Stock Price

Add a new stock market price.

## Endpoint

```http
POST /api/market-data/:symbol/price
```

## Example

```bash
POST http://localhost:3000/api/market-data/AAPL/price
```

## Request Body

```json
{
  "price": 189.45
}
```

## Success Response

```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "price": 189.45,
    "timestamp": "2026-06-03T10:30:00.000Z"
  }
}
```

---

# 8. Get Latest Stock Price

Get the latest recorded stock price.

## Endpoint

```http
GET /api/market-data/:symbol/price
```

## Example

```bash
GET http://localhost:3000/api/market-data/AAPL/price
```

## Success Response

```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "price": 189.45,
    "timestamp": "2026-06-03T10:30:00.000Z"
  }
}
```

---

# 9. Get Stock Price History

Get stock price history.

## Endpoint

```http
GET /api/market-data/:symbol/history
```

## Example

```bash
GET http://localhost:3000/api/market-data/AAPL/history
```

---

# 10. Get Limited Price History

Get limited number of historical price records.

## Endpoint

```http
GET /api/market-data/:symbol/history?limit=5
```

## Example

```bash
GET http://localhost:3000/api/market-data/AAPL/history?limit=5
```

---

# Suggested Route Order

```ts
router.get("/search", stockController.searchStocks);

router.get("/", stockController.getAllStocks);

router.post("/", stockController.createStock);

router.post("/:symbol/price", stockController.recordStockPrice);

router.get("/:symbol/price", stockController.getLatestPrice);

router.get("/:symbol/history", stockController.getPriceHistory);

router.get("/:symbol", stockController.getStockBySymbol);

router.put("/:id", stockController.updateStock);

router.delete("/:id", stockController.deleteStock);
```
