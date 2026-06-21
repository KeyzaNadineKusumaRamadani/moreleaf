const { pool } = require('../config/database');

// @POST /api/orders
const createOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      payment_method, recipient_name, recipient_phone,
      recipient_address, recipient_province, recipient_city,
      recipient_postal, notes, voucher_code
    } = req.body;

    // items dikirim sebagai JSON string lewat FormData, perlu di-parse dulu
    let items = req.body.items;
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Format data produk tidak valid.' });
      }
    }

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Keranjang belanja kosong.' });
    }

    let discount_amount = 0;
    if (voucher_code) {
      const [vouchers] = await conn.query(
        'SELECT * FROM vouchers WHERE code = ? AND is_active = 1 AND (expired_at IS NULL OR expired_at > NOW()) AND used_count < max_use',
        [voucher_code]
      );
      if (vouchers.length) {
        const v = vouchers[0];
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (subtotal >= v.min_purchase) {
          if (v.discount_type === 'percent') {
            discount_amount = (subtotal * v.discount_value) / 100;
          } else {
            discount_amount = v.discount_value;
          }
          await conn.query('UPDATE vouchers SET used_count = used_count + 1 WHERE code = ?', [voucher_code]);
        }
      }
    }

    let total_price = 0;
    for (const item of items) {
      const [product] = await conn.query('SELECT price, stock FROM products WHERE id = ?', [item.product_id]);
      if (!product.length) throw new Error(`Produk ID ${item.product_id} tidak ditemukan.`);
      if (product[0].stock < item.quantity) throw new Error(`Stok produk tidak mencukupi.`);
      total_price += product[0].price * item.quantity;
    }

    total_price = Math.max(0, total_price - discount_amount);

    // Bukti pembayaran (jika ada file diupload saat checkout)
    const payment_proof = req.file ? `/uploads/${req.file.filename}` : null;

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, total_price, payment_method, payment_proof, recipient_name, recipient_phone, 
       recipient_address, recipient_province, recipient_city, recipient_postal, notes, voucher_code, discount_amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, total_price, payment_method, payment_proof, recipient_name, recipient_phone,
       recipient_address, recipient_province, recipient_city, recipient_postal,
       notes, voucher_code, discount_amount]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      const [product] = await conn.query('SELECT name, price FROM products WHERE id = ?', [item.product_id]);
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, product[0].name, item.quantity, product[0].price]
      );
      await conn.query('UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?', [
        item.quantity, item.quantity, item.product_id
      ]);
    }

    // Clear cart
    const [cart] = await conn.query('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    if (cart.length) {
      await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cart[0].id]);
    }

    await conn.commit();

    // Notify admin
    const io = req.app.get('io');
    if (io) {
      await pool.query(
        'INSERT INTO notifications (title, message, type, reference_id) VALUES (?, ?, ?, ?)',
        ['Pesanan Baru', `Pesanan baru #${orderId} dari ${req.user.name}`, 'order', orderId]
      );
      io.emit('notification', { title: '🛒 Pesanan Baru', message: `Pesanan #${orderId} dari ${req.user.name}` });
    }

    res.status(201).json({
      success: true,
      message: 'Terima kasih, pesanan berhasil dibuat.',
      data: { order_id: orderId, total_price }
    });
  } catch (error) {
    await conn.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Terjadi kesalahan server.' });
  } finally {
    conn.release();
  }
};

// @POST /api/orders/:id/payment-proof - upload/update bukti bayar setelah order dibuat
const uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File bukti bayar wajib diupload.' });
    }

    const [existing] = await pool.query('SELECT user_id FROM orders WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }
    if (existing[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const payment_proof = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE orders SET payment_proof = ? WHERE id = ?', [payment_proof, req.params.id]);

    const io = req.app.get('io');
    if (io) {
      io.emit('notification', { title: '🧾 Bukti Bayar Masuk', message: `Bukti pembayaran untuk pesanan #${req.params.id} telah diunggah` });
    }

    res.json({ success: true, message: 'Bukti pembayaran berhasil diunggah.', data: { payment_proof } });
  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @GET /api/orders (user: own orders | admin: all)
const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role !== 'admin') {
      query += ' AND o.user_id = ?';
      params.push(req.user.id);
    }

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [orders] = await pool.query(query, params);

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [req.params.id]
    );

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    if (req.user.role !== 'admin' && orders[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.image FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...orders[0], items } });
  } catch (error) {
    console.error('Get order by id error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @PUT /api/orders/:id/status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'diproses', 'dikemas', 'dikirim', 'selesai', 'dibatalkan'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid.' });
    }

    const [existing] = await pool.query('SELECT id FROM orders WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);

    const io = req.app.get('io');
    if (io) {
      io.emit('order_status_update', { order_id: req.params.id, status });
    }

    res.json({ success: true, message: 'Status pesanan berhasil diperbarui.' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @GET /api/orders/stats (admin only)
const getOrderStats = async (req, res) => {
  try {
    const [totalStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_price) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'selesai' THEN 1 END) as completed_orders
      FROM orders
    `);

    const [dailySales] = await pool.query(`
      SELECT DATE(created_at) as date, SUM(total_price) as total, COUNT(*) as count
      FROM orders WHERE status != 'dibatalkan' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at) ORDER BY date ASC
    `);

    const [monthlySales] = await pool.query(`
      SELECT MONTH(created_at) as month, YEAR(created_at) as year, SUM(total_price) as total, COUNT(*) as count
      FROM orders WHERE status != 'dibatalkan'
      GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY year DESC, month DESC LIMIT 12
    `);

    const [topProducts] = await pool.query(`
      SELECT p.name, p.image, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id WHERE o.status != 'dibatalkan'
      GROUP BY oi.product_id ORDER BY total_sold DESC LIMIT 5
    `);

    res.json({ success: true, data: { ...totalStats[0], dailySales, monthlySales, topProducts } });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { createOrder, uploadPaymentProof, getOrders, getOrderById, updateOrderStatus, getOrderStats };