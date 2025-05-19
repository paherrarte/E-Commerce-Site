const express = require('express');
const router = express.Router();
const db = require('../database');

// Shop page route
router.get('/shop', (req, res) => {
  db.all('SELECT * FROM products', (err, products) => {
    if (err) {
      console.error('Error fetching products:', err.message);
      return res.status(500).send('Database error');
    }

    res.render('shop', {
      products,
      user: req.session.user,
      cart: req.session.cart || []
    });
  });
});

// Add to cart route (from DB)
router.post('/add-to-cart', (req, res) => {
  const { productId } = req.body;
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not logged in' });

  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err || !product) return res.status(404).json({ error: 'Product not found' });

    if (!req.session.cart) req.session.cart = [];

    const existing = req.session.cart.find(p => p.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      req.session.cart.push({ ...product, quantity: 1 });
    }

    res.json({ success: true });
  });
});

// View cart route
router.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  res.render('cart', {
    cart,
    total,
    user: req.session.user
  });
});

// Remove from cart route
router.post('/remove-from-cart', (req, res) => {
  const { productId } = req.body;

  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.id !== parseInt(productId));
  }

  res.json({ success: true, cart: req.session.cart });
});

// Checkout page
router.get('/checkout', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.render('checkout', {
    cart,
    total,
    user: req.session.user
  });
});

// Process checkout
router.post('/process-checkout', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Login required' });

  // Simulate success
  req.session.cart = [];
  res.json({ success: true, message: 'Order placed successfully!' });
});

// Serve cart contents as JSON for frontend dropdown
router.get('/cart-json', (req, res) => {
  const cart = req.session.cart || [];
  res.json({ cart });
});

module.exports = router;