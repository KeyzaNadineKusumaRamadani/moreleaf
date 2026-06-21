import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Truck, CreditCard, QrCode, Wallet, Upload, X, ImageIcon } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services';
import { formatCurrency, getImageUrl } from '../../utils/format';
import { Seo } from '../../components/common/Misc';
import { BankTransferInfo, QrisInfo } from '../../components/common/PaymentInfo';

const paymentMethods = [
  { value: 'cod', label: 'COD (Bayar di Tempat)', icon: Wallet },
  { value: 'transfer', label: 'Transfer Bank', icon: CreditCard },
  { value: 'qris', label: 'QRIS', icon: QrCode },
];

const Checkout = () => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [voucher, setVoucher] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofError, setProofError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      recipient_name: user?.name || '',
      recipient_phone: user?.phone || '',
      payment_method: 'cod',
    },
  });

  const selectedPaymentMethod = watch('payment_method');
  const needsProof = selectedPaymentMethod === 'transfer' || selectedPaymentMethod === 'qris';

  useEffect(() => {
    const stored = sessionStorage.getItem('moreleaf_voucher');
    if (stored) setVoucher(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!cart.items || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Reset bukti bayar kalau pindah ke COD
  useEffect(() => {
    if (!needsProof) {
      setProofFile(null);
      setProofPreview(null);
      setProofError('');
    }
  }, [needsProof]);

  const subtotal = cart.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const discount = voucher?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
      setProofError('');
    }
  };

  const removeProof = () => {
    setProofFile(null);
    setProofPreview(null);
  };

  const onSubmit = async (data) => {
    if (needsProof && !proofFile) {
      setProofError('Bukti pembayaran wajib diupload untuk metode ini.');
      toast.error('Silakan upload bukti pembayaran terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      const items = cart.items.map((item) => ({ product_id: item.product_id, price: item.price, quantity: item.quantity }));

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value || ''));
      formData.append('items', JSON.stringify(items));
      if (voucher?.code) formData.append('voucher_code', voucher.code);
      if (proofFile) formData.append('payment_proof', proofFile);

      const res = await orderService.create(formData);
      sessionStorage.removeItem('moreleaf_voucher');
      toast.success('Terima kasih, pesanan berhasil dibuat.');
      await refreshCart();
      navigate(`/order-success/${res.data.data.order_id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.items || cart.items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo title="Checkout" />
      <h1 className="font-display font-bold text-3xl text-primary dark:text-accent mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Truck size={18} /> Data Pengiriman
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nama Lengkap</label>
                <input
                  {...register('recipient_name', { required: 'Nama wajib diisi' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
                />
                {errors.recipient_name && <p className="text-red-500 text-xs mt-1">{errors.recipient_name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">No HP</label>
                <input
                  {...register('recipient_phone', { required: 'No HP wajib diisi' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
                />
                {errors.recipient_phone && <p className="text-red-500 text-xs mt-1">{errors.recipient_phone.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Alamat Lengkap</label>
                <textarea
                  {...register('recipient_address', { required: 'Alamat wajib diisi' })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary resize-none"
                />
                {errors.recipient_address && <p className="text-red-500 text-xs mt-1">{errors.recipient_address.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Provinsi</label>
                <input
                  {...register('recipient_province', { required: 'Provinsi wajib diisi' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
                />
                {errors.recipient_province && <p className="text-red-500 text-xs mt-1">{errors.recipient_province.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Kota</label>
                <input
                  {...register('recipient_city', { required: 'Kota wajib diisi' })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
                />
                {errors.recipient_city && <p className="text-red-500 text-xs mt-1">{errors.recipient_city.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Kode Pos</label>
                <input
                  {...register('recipient_postal')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Catatan (Opsional)</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Contoh: titip di pos satpam"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-semibold text-lg mb-4">Metode Pembayaran</h2>
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <label
                  key={pm.value}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary transition has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input type="radio" value={pm.value} {...register('payment_method')} className="accent-primary" />
                  <pm.icon size={18} className="text-primary dark:text-accent" />
                  <span className="font-medium text-sm">{pm.label}</span>
                </label>
              ))}
            </div>

            {selectedPaymentMethod === 'transfer' && <BankTransferInfo />}
            {selectedPaymentMethod === 'qris' && <QrisInfo />}

            {needsProof && (
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">
                  Upload Bukti Pembayaran <span className="text-red-500">*</span>
                </label>

                {proofPreview ? (
                  <div className="relative w-full max-w-xs">
                    <img src={proofPreview} alt="Bukti bayar" className="w-full rounded-xl border border-gray-200 dark:border-gray-700" />
                    <button
                      type="button"
                      onClick={removeProof}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"
                      aria-label="Hapus gambar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl py-8 cursor-pointer hover:border-primary transition">
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-sm text-gray-500">Klik untuk upload screenshot/foto bukti transfer</span>
                    <span className="text-xs text-gray-400">JPG, PNG (maks. 5MB)</span>
                    <input type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
                  </label>
                )}

                {proofError && <p className="text-red-500 text-xs mt-2">{proofError}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-display font-semibold text-lg mb-4">Pesanan Anda</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                    ) : <span className="text-xl">🍃</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.quantity}x {formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-gray-100 dark:border-gray-700">
                <span>Total</span>
                <span className="text-primary dark:text-accent">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition disabled:opacity-50"
            >
              {submitting ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;