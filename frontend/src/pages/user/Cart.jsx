import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { cartService } from '../../services';
import { formatCurrency, getImageUrl } from '../../utils/format';
import { EmptyState, Seo } from '../../components/common/Misc';
import { Spinner } from '../../components/common/Skeletons';

const Cart = () => {
  const { cart, loading, updateQuantity, removeItem, refreshCart } = useCart();
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');
  const [voucher, setVoucher] = useState(null);
  const [applying, setApplying] = useState(false);

  const subtotal = cart.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const discount = voucher?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  const applyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setApplying(true);
    try {
      const res = await cartService.validateVoucher({ code: voucherCode.trim(), subtotal });
      setVoucher(res.data.data);
      toast.success('Voucher berhasil digunakan!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Voucher tidak valid.');
      setVoucher(null);
    } finally {
      setApplying(false);
    }
  };

  const handleCheckout = () => {
    if (voucher) {
      sessionStorage.setItem('moreleaf_voucher', JSON.stringify(voucher));
    } else {
      sessionStorage.removeItem('moreleaf_voucher');
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Seo title="Keranjang" />
        <EmptyState
          icon="🛒"
          title="Keranjang Anda kosong"
          description="Yuk, mulai belanja camilan sehat dari daun kelor sekarang!"
          action={
            <Link to="/products" className="inline-block px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition">
              Mulai Belanja
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo title="Keranjang Belanja" />
      <h1 className="font-display font-bold text-3xl text-primary dark:text-accent mb-8">Keranjang Belanja</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex gap-4 shadow-sm">
              <div className="w-20 h-20 rounded-xl bg-accent/10 overflow-hidden shrink-0 flex items-center justify-center">
                {item.image ? (
                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🍃</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product_id}`} className="font-display font-semibold hover:text-primary transition line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-primary dark:text-accent font-bold mt-1">{formatCurrency(item.price)}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-2" aria-label="Kurangi"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                      className="p-2" aria-label="Tambah"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition" aria-label="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <ShoppingBag size={18} /> Ringkasan Pesanan
            </h2>

            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Kode Voucher</label>
              {voucher ? (
                <div className="flex items-center justify-between bg-primary/10 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-medium text-primary dark:text-accent flex items-center gap-1.5">
                    <Tag size={14} /> {voucher.code}
                  </span>
                  <button onClick={() => { setVoucher(null); setVoucherCode(''); }} aria-label="Hapus voucher">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Masukkan kode"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary text-sm"
                  />
                  <button
                    onClick={applyVoucher}
                    disabled={applying}
                    className="px-4 py-2.5 bg-secondary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50"
                  >
                    {applying ? '...' : 'Pakai'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon Voucher</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-gray-100 dark:border-gray-700">
                <span>Total</span>
                <span className="text-primary dark:text-accent">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
