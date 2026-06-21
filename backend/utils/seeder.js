// Standalone seeder script - run with: npm run seed
// This is an alternative to the SQL file for seeding via Node.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const seed = async () => {
  try {
    console.log('🌱 Starting seeder...');

    // Admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [existingAdmin] = await pool.execute('SELECT id FROM users WHERE email = ?', ['admin@moreleaf.com']);

    if (!existingAdmin.length) {
      await pool.execute(
        'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
        ['Admin Moreleaf', 'admin@moreleaf.com', hashedPassword, 'admin', '081615980113']
      );
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Categories
    const categories = ['Muffin', 'Cookies', 'Brownies'];
    for (const name of categories) {
      const [existing] = await pool.execute('SELECT id FROM categories WHERE name = ?', [name]);
      if (!existing.length) {
        await pool.execute('INSERT INTO categories (name) VALUES (?)', [name]);
      }
    }
    console.log('✅ Categories seeded');

    const [cats] = await pool.execute('SELECT id, name FROM categories');
    const catMap = {};
    cats.forEach((c) => (catMap[c.name] = c.id));

    const products = [
      { category: 'Muffin', name: 'Choco Muffin Original', price: 7000, stock: 50,
        description: 'Muffin coklat lembut berbahan dasar daun kelor organik.',
        composition: 'Tepung terigu, daun kelor organik, coklat bubuk, telur, butter, gula',
        benefits: 'Kaya zat besi, tinggi protein, mengandung antioksidan' },
      { category: 'Muffin', name: 'Choco Muffin Triple Choco', price: 7000, stock: 45,
        description: 'Sensasi tiga lapis coklat dengan kandungan daun kelor organik.',
        composition: 'Tepung terigu, daun kelor organik, dark/milk/white chocolate',
        benefits: 'Kaya zat besi, tinggi protein, mengandung flavonoid' },
      { category: 'Muffin', name: 'Choco Muffin Butterscotch', price: 7000, stock: 40,
        description: 'Muffin dengan aroma butterscotch dan daun kelor organik.',
        composition: 'Tepung terigu, daun kelor organik, butterscotch chips, butter',
        benefits: 'Kaya zat besi, tinggi kalsium, mengandung protein nabati' },
      { category: 'Cookies', name: 'Moreleaf Cookies', price: 7000, stock: 100,
        description: 'Cookies renyah berbahan dasar daun kelor organik.',
        composition: 'Tepung terigu, daun kelor organik, chocolate chips, butter',
        benefits: 'Kaya zat besi dan kalsium, tinggi vitamin C, sumber serat' },
      { category: 'Brownies', name: 'Brownies Keju', price: 4000, stock: 80,
        description: 'Brownies lembut dengan taburan keju gurih.',
        composition: 'Tepung terigu, daun kelor organik, coklat batang, keju cheddar',
        benefits: 'Kaya protein, tinggi kalsium, mengandung zat besi' },
      { category: 'Brownies', name: 'Brownies Coklat', price: 4000, stock: 75,
        description: 'Brownies coklat klasik dengan daun kelor organik.',
        composition: 'Tepung terigu, daun kelor organik, dark chocolate, butter',
        benefits: 'Mengandung antioksidan tinggi, kaya zat besi dan protein' },
      { category: 'Brownies', name: 'Brownies Mix (Keju & Coklat)', price: 4000, stock: 60,
        description: 'Paduan rasa keju gurih dan coklat manis dengan daun kelor.',
        composition: 'Tepung terigu, daun kelor organik, dark chocolate, keju cheddar',
        benefits: 'Kaya protein ganda, tinggi kalsium dan zat besi' },
    ];

    for (const p of products) {
      const [existing] = await pool.execute('SELECT id FROM products WHERE name = ?', [p.name]);
      if (!existing.length) {
        await pool.execute(
          'INSERT INTO products (category_id, name, description, composition, benefits, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [catMap[p.category], p.name, p.description, p.composition, p.benefits, p.price, p.stock]
        );
      }
    }
    console.log('✅ Products seeded');
    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

seed();
