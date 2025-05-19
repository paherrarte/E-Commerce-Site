const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../database');
const path = require('path');
const fs = require('fs');

//login form
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

//login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.render('login', { error: 'Database error' });
    if (!user) return res.render('login', { error: 'Invalid credentials' });

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        req.session.user = { id: user.id, email: user.email, profilePic: user.profilePic };
        res.redirect('/profile');
      } else {
        res.render('login', { error: 'Invalid credentials' });
      }
    });
  });
});

// Show register form
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

//register
router.post('/register', (req, res) => {
  const { email, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.render('register', { error: 'Error encrypting password' });

    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function (err) {
      if (err) {
        const msg = err.message.includes('UNIQUE') ? 'Email already exists' : 'Registration failed';
        return res.render('register', { error: msg });
      }

      req.session.user = { id: this.lastID, email, profilePic: '/images/default-profile-pic.jpg' };
      res.redirect('/profile');
    });
  });
});

//profile
router.get('/profile', (req, res) => {
  if (!req.session.user) {return res.redirect('/login'); }

  res.render('profile', {user: req.session.user});
});

//logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

//home
router.get('/home', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/'); 
  }
  res.render('home', { 
    user: req.session.user 
  });
});

//about
router.get('/about', (req, res) => {
  res.render('about', {
    user: req.session.user || null
  });
});

//profile picture upload
router.post('/upload-profile-pic', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/'); 
  }
  
  if (!req.files || !req.files.profilePic) {
    return res.status(400).send('Please choose an Image.');
  }

  const file = req.files.profilePic;
  const uploadPath = path.join(__dirname, '../public/user-uploads', file.name);
  const relativePath = `/user-uploads/${file.name}`;

  //move image file to public/user-uploads
  file.mv(uploadPath, err => {
    if (err) return res.status(500).send(err);

    //update database
    db.run(`UPDATE users SET profilePic = ? WHERE id = ?`, [relativePath, req.session.user.id], err => {
      if (err) return res.status(500).send('User image change failed.');
      req.session.user.profilePic = relativePath;
      res.redirect('/profile');
    });
  });
});







//cart
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