import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { wishlistService } from '../../services';
import ProductCard from '../../components/common/ProductCard';
import { ProductGridSkeleton } from '../../components/common/Skeletons';
import { EmptyState, Seo } from '../../components/common/Misc';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistService.getAll();
      setItems(res.data.data);
    } catch (error) {
      toast.error('Gagal memuat wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo title="Wishlist" />
      <h1 className="font-display font-bold text-3xl text-primary dark:text-accent mb-8">Wishlist Saya</h1>

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="💚"
          title="Wishlist Anda kosong"
          description="Simpan produk favorit Anda di sini agar mudah ditemukan nanti."
          action={
            <Link to="/products" className="inline-block px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition">
              Jelajahi Produk
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} wishlisted onWishlistChange={fetchWishlist} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
