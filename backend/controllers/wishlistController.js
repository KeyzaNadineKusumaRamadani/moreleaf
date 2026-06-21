const { pool } = require('../config/database');

const getWishlist = async (req, res) => {
  try {
    const [items] = await pool.execute(
      `SELECT w.id as wishlist_id, p.* FROM wishlist w 
       JOIN products p ON w.product_id = p.id WHERE w.user_id = ? ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const [existing] = await pool.execute('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', [
      req.user.id, product_id
    ]);

    if (existing.length) {
      return res.status(400).json({ success: false, message: 'Produk sudah ada di wishlist.' });
    }

    await pool.execute('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id]);
    res.status(201).json({ success: true, message: 'Produk ditambahkan ke wishlist.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    await pool.execute('DELETE FROM wishlist WHERE product_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Produk dihapus dari wishlist.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
