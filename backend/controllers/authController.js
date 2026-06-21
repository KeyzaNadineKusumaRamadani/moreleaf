const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { sendOTPEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null]
    );

    // Create empty cart for new user
    await pool.execute('INSERT INTO carts (user_id) VALUES (?)', [result.insertId]);

    // Notify admin via socket
    const io = req.app.get('io');
    if (io) {
      await pool.execute(
        'INSERT INTO notifications (title, message, type, reference_id) VALUES (?, ?, ?, ?)',
        ['User Baru', `${name} baru saja mendaftar`, 'user', result.insertId]
      );
      io.emit('notification', { title: '👤 User Baru', message: `${name} baru saja mendaftar` });
    }

    const token = generateToken(result.insertId);
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      data: { id: result.insertId, name, email, phone, role: 'user', token },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const user = rows[0];

    if (user.is_blocked) {
      return res.status(403).json({ success: false, message: 'Akun Anda telah diblokir. Hubungi admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const token = generateToken(user.id);
    res.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, avatar, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    const [addresses] = await pool.execute('SELECT * FROM addresses WHERE user_id = ?', [req.user.id]);

    res.json({ success: true, data: { ...rows[0], addresses } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, province, city, postal_code, address } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : req.user.avatar;

    await pool.execute('UPDATE users SET name = ?, phone = ?, avatar = ? WHERE id = ?', [
      name || req.user.name,
      phone || req.user.phone,
      avatar,
      req.user.id,
    ]);

    if (province || city || postal_code || address) {
      const [existing] = await pool.execute('SELECT id FROM addresses WHERE user_id = ? AND is_default = 1', [req.user.id]);
      if (existing.length) {
        await pool.execute(
          'UPDATE addresses SET province = ?, city = ?, postal_code = ?, address = ? WHERE user_id = ? AND is_default = 1',
          [province, city, postal_code, address, req.user.id]
        );
      } else {
        await pool.execute(
          'INSERT INTO addresses (user_id, province, city, postal_code, address, is_default) VALUES (?, ?, ?, ?, ?, 1)',
          [req.user.id, province, city, postal_code, address]
        );
      }
    }

    res.json({ success: true, message: 'Profil berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.execute('SELECT id, name FROM users WHERE email = ?', [email]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Email tidak ditemukan.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.execute('UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?', [otp, otpExpires, email]);

    await sendOTPEmail(email, rows[0].name, otp);

    res.json({ success: true, message: 'Kode OTP telah dikirim ke email Anda.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim OTP.' });
  }
};

// @POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const [rows] = await pool.execute(
      'SELECT id, otp_expires FROM users WHERE email = ? AND otp = ?',
      [email, otp]
    );

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'OTP tidak valid.' });
    }

    if (new Date() > new Date(rows[0].otp_expires)) {
      return res.status(400).json({ success: false, message: 'OTP sudah kadaluarsa.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password = ?, otp = NULL, otp_expires = NULL WHERE email = ?', [
      hashedPassword,
      email,
    ]);

    res.json({ success: true, message: 'Password berhasil direset.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { register, login, getProfile, updateProfile, forgotPassword, resetPassword };
