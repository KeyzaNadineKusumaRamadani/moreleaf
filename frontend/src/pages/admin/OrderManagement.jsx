import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Eye, Download, Search, ImageIcon } from 'lucide-react';
import { orderService } from '../../services';
import { downloadInvoice } from '../../services/api';
import { formatCurrency, formatDateTime, statusLabels, getImageUrl } from '../../utils/format';
import { Modal } from '../../components/admin/AdminUI';
import { EmptyState } from '../../components/common/Misc';
import { TableRowSkeleton } from '../../components/common/Skeletons';

const statusOptions = ['pending', 'diproses', 'dikemas', 'dikirim', 'selesai', 'dibatalkan'];

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [proofModalUrl, setProofModalUrl] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAll(filter ? { status: filter, limit: 100 } : { limit: 100 });
      setOrders(res.data.data);
    } catch (error) {
      toast.error('Gagal memuat pesanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const openDetail = async (order) => {
    try {
      const res = await orderService.getById(order.id);
      setDetailOrder(res.data.data);
    } catch (error) {
      toast.error('Gagal memuat detail pesanan.');
    }
  };

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      await orderService.updateStatus(detailOrder.id, status);
      toast.success('Status pesanan berhasil diperbarui.');
      setDetailOrder((prev) => ({ ...prev, status }));
      fetchOrders();
    } catch (error) {
      toast.error('Gagal memperbarui status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    setDownloadingId(orderId);
    try {
      await downloadInvoice(orderId);
    } catch (error) {
      toast.error('Gagal mengunduh invoice.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = orders.filter(
    (o) => !search || o.id.toString().includes(search) || o.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-primary dark:text-accent mb-6">Kelola Pesanan</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID atau nama..."
            className="pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-primary text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-primary text-sm"
        >
          <option value="">Semua Status</option>
          {statusOptions.map((s) => <option key={s} value={s}>{statusLabels[s]?.label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Pelanggan</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Bukti Bayar</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon="📦" title="Tidak ada pesanan" /></td></tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 font-medium">#{o.id}</td>
                    <td className="px-4 py-3">{o.user_name || 'N/A'}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(o.total_price)}</td>
                    <td className="px-4 py-3">
                      {o.payment_proof ? (
                        <button
                          onClick={() => setProofModalUrl(getImageUrl(o.payment_proof))}
                          className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                          <img src={getImageUrl(o.payment_proof)} alt="Bukti bayar" className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {o.payment_method === 'cod' ? '— (COD)' : 'Belum upload'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusLabels[o.status]?.color}`}>
                        {statusLabels[o.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openDetail(o)} className="p-2 rounded-lg hover:bg-primary/10 text-primary dark:text-accent" aria-label="Lihat">
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(o.id)}
                          disabled={downloadingId === o.id}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                          aria-label="Invoice"
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={`Pesanan #${detailOrder?.id}`} maxWidth="max-w-xl">
        {detailOrder && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Ubah Status</label>
              <select
                value={detailOrder.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
              >
                {statusOptions.map((s) => <option key={s} value={s}>{statusLabels[s]?.label}</option>)}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Pelanggan</p>
                <p className="font-medium">{detailOrder.user_name}</p>
                <p className="text-gray-500">{detailOrder.recipient_phone}</p>
              </div>
              <div>
                <p className="text-gray-400">Pembayaran</p>
                <p className="font-medium uppercase">{detailOrder.payment_method}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-400">Alamat</p>
                <p className="font-medium">
                  {detailOrder.recipient_address}, {detailOrder.recipient_city}, {detailOrder.recipient_province} {detailOrder.recipient_postal}
                </p>
              </div>
            </div>

            {/* Bukti Pembayaran */}
            {detailOrder.payment_method !== 'cod' && (
              <div>
                <p className="text-sm font-medium mb-2">Bukti Pembayaran</p>
                {detailOrder.payment_proof ? (
                  <a href={getImageUrl(detailOrder.payment_proof)} target="_blank" rel="noopener noreferrer">
                    <img
                      src={getImageUrl(detailOrder.payment_proof)}
                      alt="Bukti pembayaran"
                      className="w-full max-w-xs rounded-xl border border-gray-200 dark:border-gray-700 hover:opacity-90 transition"
                    />
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2">
                    <ImageIcon size={16} /> Pelanggan belum mengunggah bukti pembayaran.
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Produk</p>
              <div className="space-y-2">
                {detailOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2">
                    <span>{item.product_name} x{item.quantity}</span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between font-display font-bold pt-3 border-t border-gray-100 dark:border-gray-700">
              <span>Total</span>
              <span className="text-primary dark:text-accent">{formatCurrency(detailOrder.total_price)}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Quick preview modal for thumbnail click in table */}
      <Modal open={!!proofModalUrl} onClose={() => setProofModalUrl(null)} title="Bukti Pembayaran">
        {proofModalUrl && <img src={proofModalUrl} alt="Bukti pembayaran" className="w-full rounded-xl" />}
      </Modal>
    </div>
  );
};

export default OrderManagement;