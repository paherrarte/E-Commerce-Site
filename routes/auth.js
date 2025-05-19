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









module.exports = router;