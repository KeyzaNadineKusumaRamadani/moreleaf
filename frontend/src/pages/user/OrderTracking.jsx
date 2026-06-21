import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Circle, Download, MapPin, Phone, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { orderService, reviewService } from '../../services';
import { downloadInvoice } from '../../services/api';
import { formatCurrency, formatDateTime, statusLabels, statusOrder, getImageUrl } from '../../utils/format';
import { PageLoader } from '../../components/common/Skeletons';
import { Seo } from '../../components/common/Misc';
import { RatingInput } from '../../components/common/RatingStars';

const ReviewBox = ({ item, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(item.already_reviewed || false);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error('Silakan berikan rating bintang.');
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.create({ product_id: item.product_id, rating, comment });
      toast.success('Ulasan berhasil dikirim, terima kasih!');
      setSubmitted(true);
      onSubmitted?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim ulasan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-3 bg-primary/5 rounded-xl px-4 py-3 text-sm text-primary dark:text-accent flex items-center gap-2">
        <CheckCircle size={16} /> Anda sudah memberi ulasan untuk produk ini. Terima kasih!
      </div>
    );
  }

  return (
    <div className="mt-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
      <p className="text-sm font-medium mb-2">Beri ulasan untuk {item.product_name}</p>
      <RatingInput value={rating} onChange={setRating} size={20} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Bagaimana rasanya? Ceritakan pengalaman Anda..."
        rows={2}
        className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-primary text-sm resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-2 px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-dark transition disabled:opacity-50"
      >
        {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </div>
  );
};

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [reviewedProductIds, setReviewedProductIds] = useState([]);

  const fetchOrder = async () => {
    try {
      const res = await orderService.getById(id);
      setOrder(res.data.data);

      // Cek produk mana saja yang sudah pernah diulas oleh user untuk order ini
      if (res.data.data.status === 'selesai') {
        const reviewsRes = await reviewService.getAll();
        const myReviewedIds = reviewsRes.data.data
          .filter((r) => res.data.data.items.some((item) => item.product_id === r.product_id))
          .map((r) => r.product_id);
        setReviewedProductIds(myReviewedIds);
      }
    } catch (error) {
      toast.error('Pesanan tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      await downloadInvoice(order.id);
    } catch (error) {
      toast.error('Gagal mengunduh invoice.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!order) return null;

  const isCancelled = order.status === 'dibatalkan';
  const isCompleted = order.status === 'selesai';
  const currentStepIndex = statusOrder.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo title={`Pesanan #${id}`} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-primary dark:text-accent">Pesanan #{order.id}</h1>
        <button
          onClick={handleDownloadInvoice}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary dark:text-accent dark:border-accent rounded-full text-sm font-medium hover:bg-primary/5 transition disabled:opacity-50"
        >
          <Download size={15} /> {downloading ? 'Mengunduh...' : 'Invoice'}
        </button>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6">
        {isCancelled ? (
          <div className="text-center py-4">
            <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium">
              Pesanan Dibatalkan
            </span>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            {statusOrder.map((status, i) => {
              const done = i <= currentStepIndex;
              return (
                <div key={status} className="flex flex-col items-center flex-1 relative">
                  {i > 0 && (
                    <div
                      className={`absolute top-3 right-1/2 w-full h-0.5 -z-10 ${
                        i <= currentStepIndex ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                  {done ? (
                    <CheckCircle size={24} className="text-primary dark:text-accent bg-white dark:bg-gray-800 relative z-10" />
                  ) : (
                    <Circle size={24} className="text-gray-300 bg-white dark:bg-gray-800 relative z-10" />
                  )}
                  <span className={`text-xs mt-2 text-center font-medium ${done ? 'text-primary dark:text-accent' : 'text-gray-400'}`}>
                    {statusLabels[status]?.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
            <MapPin size={16} /> Alamat Pengiriman
          </h2>
          <p className="text-sm font-medium">{order.recipient_name}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Phone size={12} /> {order.recipient_phone}
          </p>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {order.recipient_address}, {order.recipient_city}, {order.recipient_province} {order.recipient_postal}
          </p>
          {order.notes && <p className="text-xs text-gray-400 mt-2 italic">Catatan: {order.notes}</p>}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-display font-semibold mb-3">Detail Pembayaran</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Metode</span>
              <span className="font-medium text-gray-700 dark:text-gray-300 uppercase">{order.payment_method}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tanggal</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{formatDateTime(order.created_at)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-display font-bold pt-2 border-t border-gray-100 dark:border-gray-700">
              <span>Total</span>
              <span className="text-primary dark:text-accent">{formatCurrency(order.total_price)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          Produk Dipesan
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-normal text-gray-400">
              <Star size={13} /> beri ulasan di bawah
            </span>
          )}
        </h2>
        <div className="space-y-5">
          {order.items?.map((item) => (
            <div key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent/10 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : <span className="text-2xl">🍃</span>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product_name}</p>
                  <p className="text-xs text-gray-400">{item.quantity} x {formatCurrency(item.price)}</p>
                </div>
                <span className="font-medium text-sm">{formatCurrency(item.price * item.quantity)}</span>
              </div>

              {isCompleted && (
                <ReviewBox
                  item={{ ...item, already_reviewed: reviewedProductIds.includes(item.product_id) }}
                  onSubmitted={() => setReviewedProductIds((prev) => [...prev, item.product_id])}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Link to="/orders" className="inline-block mt-6 text-sm text-gray-500 hover:text-primary transition">
        ← Kembali ke Daftar Pesanan
      </Link>
    </div>
  );
};

export default OrderTracking;