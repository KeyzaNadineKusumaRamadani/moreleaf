const { pool } = require('../config/database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// @GET /api/orders/:id/invoice
const generateInvoice = async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, u.name as user_name, u.email as user_email FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [req.params.id]
    );

    if (!orders.length) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });

    const order = orders[0];
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.id}.pdf`);
    doc.pipe(res);

    doc.fillColor('#1B5E20').fontSize(24).text('MORELEAF', 50, 50);
    doc.fillColor('#2E7D32').fontSize(10).text('Healthy Snack From Moringa Leaves', 50, 78);
    doc.fillColor('#000').fontSize(16).text('INVOICE', 400, 50, { align: 'right' });
    doc.fontSize(10).text(`No. Invoice: #${order.id}`, 400, 75, { align: 'right' });
    doc.text(`Tanggal: ${new Date(order.created_at).toLocaleDateString('id-ID')}`, 400, 90, { align: 'right' });

    doc.moveTo(50, 120).lineTo(550, 120).strokeColor('#81C784').stroke();

    doc.fontSize(11).fillColor('#000').text('Ditagihkan kepada:', 50, 135);
    doc.fontSize(10).text(order.recipient_name || order.user_name, 50, 152);
    doc.text(order.recipient_phone || '', 50, 167);
    doc.text(order.recipient_address || '', 50, 182, { width: 250 });

    let y = 230;
    doc.fontSize(10).fillColor('#fff').rect(50, y, 500, 20).fill('#1B5E20');
    doc.fillColor('#fff').text('Produk', 60, y + 5).text('Qty', 320, y + 5).text('Harga', 380, y + 5).text('Subtotal', 460, y + 5);
    y += 25;

    doc.fillColor('#000');
    items.forEach((item) => {
      doc.fontSize(9).text(item.product_name, 60, y, { width: 250 });
      doc.text(item.quantity.toString(), 320, y);
      doc.text(`Rp${Number(item.price).toLocaleString('id-ID')}`, 380, y);
      doc.text(`Rp${(item.price * item.quantity).toLocaleString('id-ID')}`, 460, y);
      y += 20;
    });

    y += 10;
    doc.moveTo(50, y).lineTo(550, y).strokeColor('#81C784').stroke();
    y += 15;

    if (order.discount_amount > 0) {
      doc.fontSize(10).text('Diskon Voucher:', 380, y);
      doc.text(`-Rp${Number(order.discount_amount).toLocaleString('id-ID')}`, 460, y);
      y += 18;
    }

    doc.fontSize(12).fillColor('#1B5E20').text('Total:', 380, y);
    doc.text(`Rp${Number(order.total_price).toLocaleString('id-ID')}`, 460, y);

    y += 30;
    doc.fontSize(9).fillColor('#666').text(`Metode Pembayaran: ${order.payment_method.toUpperCase()}`, 50, y);
    doc.text(`Status: ${order.status.toUpperCase()}`, 50, y + 15);

    doc.fontSize(9).fillColor('#999').text('Terima kasih telah berbelanja di Moreleaf!', 50, 700, { align: 'center', width: 500 });

    doc.end();
  } catch (error) {
    console.error('Invoice error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat invoice.' });
  }
};

// @GET /api/export/orders - export to Excel (admin only)
const exportOrdersExcel = async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.id, u.name as customer, o.total_price, o.status, o.payment_method, o.created_at
       FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pesanan');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Pelanggan', key: 'customer', width: 25 },
      { header: 'Total', key: 'total_price', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Metode Bayar', key: 'payment_method', width: 15 },
      { header: 'Tanggal', key: 'created_at', width: 20 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    orders.forEach((order) => sheet.addRow(order));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pesanan-moreleaf.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengekspor data.' });
  }
};

// @GET /api/export/products - export to Excel (admin only)
const exportProductsExcel = async (req, res) => {
  try {
    const [products] = await pool.execute(
      `SELECT p.id, p.name, c.name as category, p.price, p.stock, p.sold, p.rating_avg
       FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id ASC`
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Produk');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nama Produk', key: 'name', width: 30 },
      { header: 'Kategori', key: 'category', width: 15 },
      { header: 'Harga', key: 'price', width: 15 },
      { header: 'Stok', key: 'stock', width: 10 },
      { header: 'Terjual', key: 'sold', width: 10 },
      { header: 'Rating', key: 'rating_avg', width: 10 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } };

    products.forEach((p) => sheet.addRow(p));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=produk-moreleaf.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor data.' });
  }
};

module.exports = { generateInvoice, exportOrdersExcel, exportProductsExcel };
