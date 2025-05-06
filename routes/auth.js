const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../database');

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
        req.session.user = { id: user.id, email: user.email };
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
      req.session.user = { id: this.lastID, email };
      res.redirect('/profile');
    });
  });
});

//profile
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); 
  }
  res.render('profile', { 
    user: req.session.user 
  });
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

//shop
router.get('/shop', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/'); 
  }
  res.render('shop', { 
    user: req.session.user 
  });
});

//about
router.get('/about', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/'); 
  }
  res.render('about', { 
    user: req.session.user 
  });
});

module.exports = router;