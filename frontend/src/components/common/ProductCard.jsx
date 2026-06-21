import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { formatCurrency, getImageUrl } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { wishlistService } from '../../services';
import { toast } from 'react-toastify';
import { useState } from 'react';

const ProductCard = ({ product, wishlisted = false, onWishlistChange }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wish, setWish] = useState(wishlisted);
  const [busy, setBusy] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    await addToCart(product.id, 1);
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Silakan login untuk menggunakan wishlist.');
      return;
    }
    setBusy(true);
    try {
      if (wish) {
        await wishlistService.remove(product.id);
        setWish(false);
      } else {
        await wishlistService.add(product.id);
        setWish(true);
      }
      onWishlistChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui wishlist.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-accent/10">
        {product.image ? (
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍃</div>
        )}
        <button
          onClick={toggleWishlist}
          disabled={busy}
          aria-label="Tambah ke wishlist"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-sm hover:scale-110 transition"
        >
          <Heart size={16} className={wish ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
        </button>
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Stok Habis</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-secondary font-medium mb-1">{product.category_name}</p>
        <h3 className="font-display font-semibold text-sm sm:text-base line-clamp-2 mb-1 group-hover:text-primary transition">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          <span>{Number(product.rating_avg || 0).toFixed(1)}</span>
          <span>({product.rating_count || 0})</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-display font-bold text-primary dark:text-accent">{formatCurrency(product.price)}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            aria-label="Tambah ke keranjang"
            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
