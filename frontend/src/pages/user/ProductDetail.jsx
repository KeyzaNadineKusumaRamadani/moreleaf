import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, Star, Package, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { productService } from '../../services/productService';
import { reviewService, wishlistService } from '../../services';
import { formatCurrency, getImageUrl, formatDate } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { RatingStars, RatingInput } from '../../components/common/RatingStars';
import { PageLoader } from '../../components/common/Skeletons';
import { Seo, EmptyState } from '../../components/common/Misc';

const tabs = ['Deskripsi', 'Komposisi', 'Manfaat', 'Ulasan'];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('Deskripsi');
  const [wish, setWish] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await productService.getById(id);
      setProduct(res.data.data);
    } catch (error) {
      toast.error('Produk tidak ditemukan.');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    setQty(1);
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (user) {
      wishlistService.getAll().then((res) => {
        setWish(res.data.data.some((p) => p.id === parseInt(id)));
      }).catch(console.error);
    }
  }, [user, id]);

  const toggleWishlist = async () => {
    if (!user) return toast.info('Silakan login untuk menggunakan wishlist.');
    try {
      if (wish) {
        await wishlistService.remove(id);
        setWish(false);
      } else {
        await wishlistService.add(id);
        setWish(true);
      }
    } catch (error) {
      toast.error('Gagal memperbarui wishlist.');
    }
  };

  const handleAddToCart = async () => {
    await addToCart(product.id, qty);
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product.id, qty);
    if (success) navigate('/cart');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) return toast.error('Silakan berikan rating.');
    setSubmittingReview(true);
    try {
      await reviewService.create({ product_id: product.id, ...reviewForm });
      toast.success('Ulasan berhasil ditambahkan!');
      setReviewForm({ rating: 0, comment: '' });
      fetchProduct();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim ulasan.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo title={product.name} description={product.description} />

      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link to="/products" className="hover:text-primary">Produk</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 dark:text-gray-300 truncate">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        <div className="aspect-square rounded-3xl overflow-hidden bg-accent/10 flex items-center justify-center">
          {product.image ? (
            <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">🍃</span>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm text-secondary font-medium mb-2">{product.category_name}</p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <RatingStars rating={product.rating_avg} showValue />
            <span className="text-sm text-gray-400">·</span>
            <span className="text-sm text-gray-500">{product.rating_count} ulasan</span>
            <span className="text-sm text-gray-400">·</span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Package size={14} /> {product.stock} stok
            </span>
          </div>

          <p className="font-display font-bold text-3xl text-primary dark:text-accent mb-6">
            {formatCurrency(product.price)}
          </p>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Jumlah:</span>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5" aria-label="Kurangi jumlah">
                <Minus size={15} />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-2.5" aria-label="Tambah jumlah">
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 px-6 py-3.5 border-2 border-primary text-primary dark:text-accent dark:border-accent rounded-full font-semibold hover:bg-primary/5 transition flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <ShoppingCart size={18} /> Tambah Keranjang
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="flex-1 px-6 py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition disabled:opacity-40"
            >
              Beli Sekarang
            </button>
            <button
              onClick={toggleWishlist}
              aria-label="Wishlist"
              className="w-14 h-14 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-300 transition shrink-0"
            >
              <Heart size={20} className={wish ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 flex gap-6 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 font-medium text-sm whitespace-nowrap border-b-2 transition ${
              activeTab === tab ? 'border-primary text-primary dark:text-accent' : 'border-transparent text-gray-500'
            }`}
          >
            {tab} {tab === 'Ulasan' && `(${product.rating_count || 0})`}
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {activeTab === 'Deskripsi' && <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>}
        {activeTab === 'Komposisi' && <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.composition}</p>}
        {activeTab === 'Manfaat' && <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.benefits}</p>}

        {activeTab === 'Ulasan' && (
          <div className="space-y-6">
            {user && user.role !== 'admin' && (
              <form onSubmit={submitReview} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="font-display font-semibold mb-3">Tulis Ulasan</h3>
                <RatingInput value={reviewForm.rating} onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))} />
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Bagaimana pengalaman Anda dengan produk ini?"
                  rows={3}
                  className="w-full mt-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary resize-none"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="mt-3 px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
              </form>
            )}

            {product.reviews?.length === 0 ? (
              <EmptyState icon="⭐" title="Belum ada ulasan" description="Jadilah yang pertama memberi ulasan untuk produk ini." />
            ) : (
              product.reviews?.map((r) => (
                <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                      {r.user_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{r.user_name || 'Pengguna'}</p>
                      <p className="text-xs text-gray-400">{formatDate(r.created_at)}</p>
                    </div>
                  </div>
                  <RatingStars rating={r.rating} size={14} />
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 leading-relaxed">{r.comment}</p>
                  {r.admin_reply && (
                    <div className="mt-3 bg-primary/5 rounded-xl p-3 text-sm">
                      <p className="font-semibold text-primary dark:text-accent mb-1">Balasan Moreleaf:</p>
                      <p className="text-gray-600 dark:text-gray-300">{r.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
