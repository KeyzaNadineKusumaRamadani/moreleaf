const { pool } = require('../config/database');

const createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
    }

    const [result] = await pool.execute('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)', [
      name, email, message
    ]);

    const io = req.app.get('io');
    if (io) {
      await pool.execute(
        'INSERT INTO notifications (title, message, type, reference_id) VALUES (?, ?, ?, ?)',
        ['Pesan Baru', `Pesan baru dari ${name}`, 'contact', result.insertId]
      );
      io.emit('notification', { title: '✉️ Pesan Baru', message: `Pesan baru dari ${name}` });
    }

    res.status(201).json({ success: true, message: 'Pesan Anda berhasil dikirim. Terima kasih!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const getContacts = async (req, res) => {
  try {
    const [contacts] = await pool.execute('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const replyContact = async (req, res) => {
  try {
    const { admin_reply } = req.body;
    await pool.execute('UPDATE contacts SET admin_reply = ?, is_read = 1 WHERE id = ?', [admin_reply, req.params.id]);
    res.json({ success: true, message: 'Balasan berhasil dikirim.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const deleteContact = async (req, res) => {
  try {
    await pool.execute('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Pesan berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { createContact, getContacts, replyContact, deleteContact };
