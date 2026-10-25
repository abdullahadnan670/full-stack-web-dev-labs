const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/techvault_ecommerce')
  .then(() => console.log('Connected to persistent MongoDB database'))
  .catch(err => console.error('DB Connection error:', err));

// ================= SCHEMAS & MODELS =================

// Matches product items in ecommerce.html
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: String,
  rating: { type: Number, default: 5 }
});
const Product = mongoose.model('Product', productSchema);

// Matches checkout modal fields in ecommerce.html
const orderSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  shippingAddress: String,
  paymentMethod: String,
  items: Array,
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// ================= PRODUCT ENDPOINTS =================

// GET all products
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// POST new product
app.post('/api/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});

// PUT update product
app.put('/api/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted successfully" });
});

// ================= ORDER / CHECKOUT ENDPOINTS =================

// POST place order (called from checkout form in ecommerce.html)
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all orders
app.get('/api/orders', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// Start Server
app.listen(5000, () => console.log('E-Commerce Persistent API running on http://localhost:5000'));