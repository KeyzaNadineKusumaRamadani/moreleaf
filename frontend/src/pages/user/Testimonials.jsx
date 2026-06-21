import { useEffect, useState } from 'react';
import { reviewService } from '../../services';
import { RatingStars } from '../../components/common/RatingStars';
import { formatDate } from '../../utils/format';
import { ProductGridSkeleton } from '../../components/common/Skeletons';
import { EmptyState, Seo } from '../../components/common/Misc';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService
      .getAll()
      .then((res) => setReviews(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo title="Testimoni" description="Lihat apa kata pelanggan tentang camilan sehat Moreleaf." />

      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-3xl text-primary dark:text-accent mb-2">Testimoni Pelanggan</h1>
        <p className="text-gray-500 mb-4">Apa kata mereka tentang Moreleaf</p>
        {reviews.length > 0 && (
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-5 py-2.5 shadow-sm">
            <RatingStars rating={avgRating} />
            <span className="font-display font-bold">{avgRating}</span>
            <span className="text-gray-400 text-sm">({reviews.length} ulasan)</span>
          </div>
        )}
      </div>

      {loading ? (
        <ProductGridSkeleton count={6} />
      ) : reviews.length === 0 ? (
        <EmptyState icon="⭐" title="Belum ada testimoni" description="Jadilah pelanggan pertama yang memberi ulasan!" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <RatingStars rating={r.rating} />
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed my-4">"{r.comment}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                  {r.user_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium text-sm">{r.user_name || 'Pengguna'}</p>
                  <p className="text-xs text-gray-400">{formatDate(r.created_at)}</p>
                </div>
              </div>
              {r.product_name && (
                <p className="text-xs text-secondary mt-3 font-medium">Produk: {r.product_name}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Testimonials;
