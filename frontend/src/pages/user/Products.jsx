import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productService, categoryService } from '../../services/productService';
import { wishlistService } from '../../services';
import ProductCard from '../../components/common/ProductCard';
import { ProductGridSkeleton } from '../../components/common/Skeletons';
import { EmptyState, Seo } from '../../components/common/Misc';
import { useAuth } from '../../context/AuthContext';

const sortOptions = [
  { value: '', label: 'Terbaru' },
  { value: 'terlaris', label: 'Terlaris' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'rating', label: 'Rating Tertinggi' },
];

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
      wishlistService.getAll().then((res) => setWishlistIds(res.data.data.map((p) => p.id))).catch(console.error);
    }
  }, [user]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ search, category, sort, page, limit: 12 });
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => setPage(1), [search, category, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo title="Produk" description="Jelajahi koleksi camilan sehat Moreleaf: Muffin, Cookies, dan Brownies berbahan dasar daun kelor organik." />

      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-primary dark:text-accent mb-2">Produk Kami</h1>
        <p className="text-gray-500">Camilan sehat berbahan dasar daun kelor organik</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:border-primary outline-none transition"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 font-medium"
        >
          <SlidersHorizontal size={18} /> Filter
        </button>

        <div className={`flex flex-col sm:flex-row gap-3 ${filtersOpen ? 'flex' : 'hidden sm:flex'}`}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-primary"
          >
            <option value="all">Semua Produk</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-primary"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {(search || category !== 'all') && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary dark:text-accent rounded-full text-sm">
              "{search}" <button onClick={() => setSearch('')}><X size={14} /></button>
            </span>
          )}
          {category !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary dark:text-accent rounded-full text-sm">
              {category} <button onClick={() => setCategory('all')}><X size={14} /></button>
            </span>
          )}
        </div>
      )}

      {loading ? (
        <ProductGridSkeleton count={12} />
      ) : products.length === 0 ? (
        <EmptyState icon="🔍" title="Produk tidak ditemukan" description="Coba ubah kata kunci atau filter pencarian Anda." />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} wishlisted={wishlistIds.includes(p.id)} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-full font-medium text-sm transition ${
                    page === i + 1 ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
