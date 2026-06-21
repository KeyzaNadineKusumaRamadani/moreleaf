const { pool } = require('../config/database');

const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      `SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count 
       FROM categories c ORDER BY c.name ASC`
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi.' });

    const [result] = await pool.execute('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan.', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const [existing] = await pool.execute('SELECT id FROM categories WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });

    await pool.execute('UPDATE categories SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ success: true, message: 'Kategori berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT id FROM categories WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan.' });

    await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
