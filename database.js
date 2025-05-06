const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`
);

// Close the connection when done (keep this for reference, but don't close until needed)
// db.close((err) => {
//   if (err) {
//     console.error('Error closing database:', err.message);
//   } else {
//     console.log('Database connection closed.');
//   }
// });

module.exports = db;