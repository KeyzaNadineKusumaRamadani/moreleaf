const { pool } = require('../config/database');

const getNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.execute('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
    const [unreadCount] = await pool.execute('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0');
    res.json({ success: true, data: notifications, unread_count: unreadCount[0].count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await pool.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getNotifications, markAsRead };
