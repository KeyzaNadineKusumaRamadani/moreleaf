const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

// @GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    let baseQuery = `
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      baseQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== 'all') {
      baseQuery += ' AND c.name = ?';
      params.push(category);
    }

    // Count total (uses only the filter params, no limit/offset)
    const [countResult] = await pool.query(`SELECT COUNT(*) as total ${baseQuery}`, params);
    const total = countResult[0].total;

    // Build the actual select query with sorting + pagination
    let query = `SELECT p.*, c.name as category_name ${baseQuery}`;

    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else if (sort === 'terlaris') query += ' ORDER BY p.sold DESC';
    else if (sort === 'rating') query += ' ORDER BY p.rating_avg DESC';
    else query += ' ORDER BY p.created_at DESC';

    // LIMIT/OFFSET written directly as numbers (not placeholders) -
    // safe because they are already parsed as integers above.
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [products] = await pool.query(query, params);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    const [reviews] = await pool.execute(
      `SELECT r.*, u.name as user_name, u.avatar as user_avatar 
       FROM reviews r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...rows[0], reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @POST /api/products (admin only)
const createProduct = async (req, res) => {
  try {
    const { category_id, name, description, composition, benefits, price, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Nama dan harga produk wajib diisi.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO products (category_id, name, description, composition, benefits, price, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [category_id, name, description, composition, benefits, price, stock || 0, image]
    );

    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan.', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @PUT /api/products/:id (admin only)
const updateProduct = async (req, res) => {
  try {
    const { category_id, name, description, composition, benefits, price, stock } = req.body;
    const [existing] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    let image = existing[0].image;
    if (req.file) {
      if (image && fs.existsSync(path.join(__dirname, '../', image))) {
        fs.unlinkSync(path.join(__dirname, '../', image));
      }
      image = `/uploads/${req.file.filename}`;
    }

    await pool.execute(
      'UPDATE products SET category_id=?, name=?, description=?, composition=?, benefits=?, price=?, stock=?, image=? WHERE id=?',
      [category_id, name, description, composition, benefits, price, stock, image, req.params.id]
    );

    res.json({ success: true, message: 'Produk berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @DELETE /api/products/:id (admin only)
const deleteProduct = async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    if (existing[0].image && fs.existsSync(path.join(__dirname, '../', existing[0].image))) {
      fs.unlinkSync(path.join(__dirname, '../', existing[0].image));
    }

    await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produk berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };