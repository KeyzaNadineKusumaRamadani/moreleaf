const { pool } = require('../config/database');

// @GET /api/cart
const getCart = async (req, res) => {
  try {
    let [cart] = await pool.execute('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);

    if (!cart.length) {
      const [result] = await pool.execute('INSERT INTO carts (user_id) VALUES (?)', [req.user.id]);
      cart = [{ id: result.insertId }];
    }

    const [items] = await pool.execute(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image, p.stock
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [cart[0].id]
    );

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.json({ success: true, data: { cart_id: cart[0].id, items, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    const [product] = await pool.execute('SELECT stock FROM products WHERE id = ?', [product_id]);
    if (!product.length) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    let [cart] = await pool.execute('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    let cartId;
    if (!cart.length) {
      const [result] = await pool.execute('INSERT INTO carts (user_id) VALUES (?)', [req.user.id]);
      cartId = result.insertId;
    } else {
      cartId = cart[0].id;
    }

    const [existing] = await pool.execute('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?', [
      cartId, product_id
    ]);

    if (existing.length) {
      const newQty = existing[0].quantity + parseInt(quantity);
      if (newQty > product[0].stock) {
        return res.status(400).json({ success: false, message: 'Stok produk tidak mencukupi.' });
      }
      await pool.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
    } else {
      if (quantity > product[0].stock) {
        return res.status(400).json({ success: false, message: 'Stok produk tidak mencukupi.' });
      }
      await pool.execute('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [
        cartId, product_id, quantity
      ]);
    }

    res.json({ success: true, message: 'Produk ditambahkan ke keranjang.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @PUT /api/cart/:id - update quantity
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Jumlah minimal 1.' });
    }

    const [item] = await pool.execute(
      `SELECT ci.*, p.stock FROM cart_items ci 
       JOIN carts c ON ci.cart_id = c.id 
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!item.length) {
      return res.status(404).json({ success: false, message: 'Item tidak ditemukan.' });
    }

    if (quantity > item[0].stock) {
      return res.status(400).json({ success: false, message: 'Stok produk tidak mencukupi.' });
    }

    await pool.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    res.json({ success: true, message: 'Keranjang berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @DELETE /api/cart/:id
const removeFromCart = async (req, res) => {
  try {
    const [item] = await pool.execute(
      `SELECT ci.id FROM cart_items ci 
       JOIN carts c ON ci.cart_id = c.id 
       WHERE ci.id = ? AND c.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!item.length) {
      return res.status(404).json({ success: false, message: 'Item tidak ditemukan.' });
    }

    await pool.execute('DELETE FROM cart_items WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produk dihapus dari keranjang.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// @POST /api/cart/voucher - validate voucher
const validateVoucher = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const [vouchers] = await pool.execute(
      'SELECT * FROM vouchers WHERE code = ? AND is_active = 1 AND (expired_at IS NULL OR expired_at > NOW()) AND used_count < max_use',
      [code]
    );

    if (!vouchers.length) {
      return res.status(404).json({ success: false, message: 'Voucher tidak valid atau sudah kadaluarsa.' });
    }

    const v = vouchers[0];
    if (subtotal < v.min_purchase) {
      return res.status(400).json({
        success: false,
        message: `Minimal belanja Rp${v.min_purchase.toLocaleString('id-ID')} untuk menggunakan voucher ini.`
      });
    }

    let discount = v.discount_type === 'percent' ? (subtotal * v.discount_value) / 100 : v.discount_value;

    res.json({ success: true, data: { code: v.code, discount_type: v.discount_type, discount_value: v.discount_value, discount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, validateVoucher };
