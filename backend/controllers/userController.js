const { pool } = require('../config/database');

const getUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, name, email, phone, avatar, role, is_blocked, created_at,
       (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as total_orders
       FROM users WHERE role = 'user' ORDER BY created_at DESC`
    );
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const blockUser = async (req, res) => {
  try {
    const { is_blocked } = req.body;
    await pool.execute('UPDATE users SET is_blocked = ? WHERE id = ?', [is_blocked, req.params.id]);
    res.json({ success: true, message: is_blocked ? 'User berhasil diblokir.' : 'User berhasil dibuka blokirnya.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [productCount] = await pool.execute('SELECT COUNT(*) as total FROM products');
    const [userCount] = await pool.execute("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
    const [orderCount] = await pool.execute('SELECT COUNT(*) as total FROM orders');
    const [salesTotal] = await pool.execute("SELECT COALESCE(SUM(total_price),0) as total FROM orders WHERE status != 'dibatalkan'");
    const [reviewCount] = await pool.execute('SELECT COUNT(*) as total FROM reviews');

    res.json({
      success: true,
      data: {
        total_products: productCount[0].total,
        total_users: userCount[0].total,
        total_orders: orderCount[0].total,
        total_sales: salesTotal[0].total,
        total_reviews: reviewCount[0].total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getUsers, blockUser, deleteUser, getDashboardStats };
