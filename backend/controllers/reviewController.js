const { pool } = require('../config/database');

const getReviews = async (req, res) => {
  try {
    const { product_id } = req.query;
    let query = `SELECT r.*, u.name as user_name, u.avatar as user_avatar, p.name as product_name
                 FROM reviews r LEFT JOIN users u ON r.user_id = u.id 
                 LEFT JOIN products p ON r.product_id = p.id WHERE 1=1`;
    const params = [];

    if (product_id) {
      query += ' AND r.product_id = ?';
      params.push(product_id);
    }

    query += ' ORDER BY r.created_at DESC';
    const [reviews] = await pool.execute(query, params);
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const createReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating) {
      return res.status(400).json({ success: false, message: 'Produk dan rating wajib diisi.' });
    }

    const [hasOrdered] = await pool.execute(
      `SELECT oi.id FROM order_items oi JOIN orders o ON oi.order_id = o.id 
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'selesai' LIMIT 1`,
      [req.user.id, product_id]
    );

    if (!hasOrdered.length) {
      return res.status(403).json({ success: false, message: 'Anda hanya dapat memberi ulasan untuk produk yang sudah dibeli dan diterima.' });
    }

    const [existing] = await pool.execute('SELECT id FROM reviews WHERE user_id = ? AND product_id = ?', [
      req.user.id, product_id
    ]);
    if (existing.length) {
      return res.status(400).json({ success: false, message: 'Anda sudah memberi ulasan untuk produk ini.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [req.user.id, product_id, rating, comment]
    );

    await pool.execute(
      `UPDATE products SET rating_avg = (SELECT AVG(rating) FROM reviews WHERE product_id = ?),
       rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?) WHERE id = ?`,
      [product_id, product_id, product_id]
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('notification', { title: '⭐ Review Baru', message: `${req.user.name} memberi ulasan baru` });
    }

    res.status(201).json({ success: true, message: 'Ulasan berhasil ditambahkan.', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const [existing] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [req.params.id]);

    if (!existing.length) return res.status(404).json({ success: false, message: 'Ulasan tidak ditemukan.' });
    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    if (req.user.role === 'admin' && req.body.admin_reply !== undefined) {
      await pool.execute('UPDATE reviews SET admin_reply = ? WHERE id = ?', [req.body.admin_reply, req.params.id]);
    } else {
      await pool.execute('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?', [rating, comment, req.params.id]);
      await pool.execute(
        `UPDATE products SET rating_avg = (SELECT AVG(rating) FROM reviews WHERE product_id = ?) WHERE id = ?`,
        [existing[0].product_id, existing[0].product_id]
      );
    }

    res.json({ success: true, message: 'Ulasan berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Ulasan tidak ditemukan.' });

    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    await pool.execute('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    await pool.execute(
      `UPDATE products SET rating_avg = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = ?), 0),
       rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?) WHERE id = ?`,
      [existing[0].product_id, existing[0].product_id, existing[0].product_id]
    );

    res.json({ success: true, message: 'Ulasan berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
