const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

//for user image uploads
const fileUpload = require('express-fileupload');
app.use('/user-uploads', express.static(path.join(__dirname, 'public/user-uploads')));
app.use(fileUpload());

app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: true
}));

//view
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//routes
app.use('/', authRoutes);
app.use('/', shopRoutes);

// Default route
app.get('/', (req, res) => {
  res.render('home', { user: req.session.user });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});