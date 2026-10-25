const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(express.json());

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Helper to read data from JSON file
async function readData(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return []; // Return empty array if file doesn't exist
  }
}

// Helper to write data to JSON file
async function writeData(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ================= PRODUCT ENDPOINTS =================
app.get('/api/products', async (req, res) => {
  const products = await readData(PRODUCTS_FILE);
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const products = await readData(PRODUCTS_FILE);
  const newProduct = { id: Date.now(), ...req.body };
  products.push(newProduct);
  await writeData(PRODUCTS_FILE, products);
  res.status(201).json(newProduct);
});

// ================= ORDER ENDPOINTS =================
app.get('/api/orders', async (req, res) => {
  const orders = await readData(ORDERS_FILE);
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  const orders = await readData(ORDERS_FILE);
  const newOrder = { id: Date.now(), ...req.body, date: new Date() };
  orders.push(newOrder);
  await writeData(ORDERS_FILE, orders);
  res.status(201).json({ message: "Order saved to file!", order: newOrder });
});

app.listen(5000, () => console.log('Persistent E-Commerce API running on http://localhost:5000'));