const db = require('./database');

const products = [
  { name: 'Running Shoes', price: 89.99, description: 'Lightweight and comfortable running shoes.', image: '/images/default-profile-pic.jpg' },
  { name: 'Compression Shorts', price: 29.99, description: 'High-performance compression shorts.', image: '/images/default-profile-pic.jpg' },
];

/*
const products = [
  { name: 'Running Shoes', price: 89.99, description: 'Lightweight and comfortable running shoes.', image: '/images/running-shoes.jpg' },
  { name: 'Compression Shorts', price: 29.99, description: 'High-performance compression shorts.', image: '/images/compression-shorts.jpg' },
  { name: 'Dry-Fit Shirt', price: 34.99, description: 'Moisture-wicking athletic shirt.', image: '/images/dry-fit-shirt.jpg' },
  { name: 'Track Suit', price: 79.99, description: 'Classic track suit for training.', image: '/images/track-suit.jpg' },
  { name: 'Gym Bag', price: 49.99, description: 'Spacious gym bag with compartments.', image: '/images/gym-bag.jpg' },
  { name: 'Soccer Jersey', price: 44.99, description: 'Professional soccer jersey.', image: '/images/jersey.jpg' },
  { name: 'Athletic Socks', price: 14.99, description: 'Socks with arch support.', image: '/images/socks.jpg' },
  { name: 'Training Hoodie', price: 59.99, description: 'Warm training hoodie.', image: '/images/hoodie.jpg' },
  { name: 'Track Pants', price: 39.99, description: 'Flexible track pants.', image: '/images/track-pants.jpg' },
  { name: 'Bape Jacket', price: 199.99, description: 'Stylish Bape jacket.', image: '/images/jacket.jpg' },
  { name: 'Jordan Shoes', price: 149.99, description: 'Classic Jordan shoes.', image: '/images/shoes.jpg' },
  { name: 'Headband', price: 9.99, description: 'Sweat-wicking headband.', image: '/images/headband.jpg' },
  { name: 'Wristbands', price: 7.99, description: 'Comfortable wristbands.', image: '/images/wristband.jpg' },
  { name: 'Water Bottle', price: 19.99, description: 'Insulated water bottle.', image: '/images/water-bottle.jpg' },
  { name: 'Athletic Cap', price: 24.99, description: 'Stylish athletic cap.', image: '/images/athletic-cap.jpg' }
];
*/

// Optional: Clear old data first
db.run('DELETE FROM products', (err) => {
  if (err) return console.error('Failed to clear products:', err.message);

  const stmt = db.prepare('INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)');

  for (const product of products) {
    stmt.run(product.name, product.price, product.description, product.image);
  }

  stmt.finalize(() => {
    console.log('✅ Products seeded successfully!');
    db.close();
  });
});