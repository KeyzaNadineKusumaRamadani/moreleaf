import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Sprout, Heart, ArrowRight, Star } from 'lucide-react';
import { productService } from '../../services/productService';
import ProductCard from '../../components/common/ProductCard';
import { ProductGridSkeleton } from '../../components/common/Skeletons';
import { Seo } from '../../components/common/Misc';
import VideoSection from '../../components/common/VideoSection';
import Gallery from '../../components/common/Gallery';

const features = [
  { icon: Leaf, title: 'Kaya Zat Besi', desc: 'Daun kelor mengandung zat besi tinggi untuk mendukung kesehatan darah.' },
  { icon: ShieldCheck, title: 'Tanpa Pewarna Buatan', desc: '100% alami tanpa bahan pewarna sintetis yang berbahaya.' },
  { icon: Sprout, title: 'Produk Lokal Indonesia', desc: 'Mendukung petani lokal dan ekonomi berkelanjutan Indonesia.' },
  { icon: Heart, title: 'Tinggi Protein & Kalsium', desc: 'Nutrisi lengkap untuk mendukung gaya hidup sehat sehari-hari.' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await productService.getAll({ sort: 'terlaris', limit: 4 });
        setProducts(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      <Seo
        title="Beranda"
        description="Moreleaf menghadirkan camilan sehat berbahan dasar daun kelor organik yang kaya nutrisi dan cocok untuk semua kalangan."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero dark:!bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <span className="inline-block px-4 py-1.5 bg-white/70 dark:bg-gray-800 backdrop-blur-sm text-primary dark:text-accent rounded-full text-xs font-semibold mb-5 shadow-sm">
              🌿 100% Daun Kelor Organik
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-primary dark:text-white leading-tight mb-4">
              MORELEAF
            </h1>
            <p className="text-lg sm:text-xl text-secondary dark:text-accent font-medium mb-4">
              Healthy Snack From Moringa Leaves
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md leading-relaxed">
              Moreleaf menghadirkan camilan sehat berbahan dasar daun kelor organik yang kaya nutrisi dan cocok untuk semua kalangan.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="px-7 py-3.5 bg-gradient-primary text-white rounded-full font-semibold hover:opacity-90 transition shadow-lg shadow-primary/20 inline-flex items-center gap-2"
              >
                Belanja Sekarang <ArrowRight size={18} />
              </Link>
              <Link
                to="/about"
                className="px-7 py-3.5 border-2 border-primary dark:border-accent text-primary dark:text-accent rounded-full font-semibold hover:bg-white/50 dark:hover:bg-gray-800 transition"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="aspect-square max-w-md mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/30">
              {!logoError ? (
                <img
                  src="/logo.jpg"
                  alt="Moreleaf"
                  className="w-full h-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <span className="text-[10rem]">🌿</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-primary dark:text-accent mb-2">Mengapa Moreleaf?</h2>
          <p className="text-gray-500 dark:text-gray-400">Camilan sehat dengan manfaat nyata untuk tubuh Anda</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition border border-gray-50 dark:border-gray-700">
              <div className="w-14 h-14 rounded-full bg-gradient-soft dark:bg-gray-700 text-primary dark:text-accent flex items-center justify-center mx-auto mb-4">
                <f.icon size={26} />
              </div>
              <h3 className="font-display font-semibold mb-2 text-gray-900 dark:text-gray-100">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Video Edukasi tentang Daun Kelor */}
      <VideoSection />

      {/* Featured Products */}
      <section className="bg-white dark:bg-gray-800/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-3xl text-primary dark:text-accent mb-1">Produk Terlaris</h2>
              <p className="text-gray-500 dark:text-gray-400">Camilan favorit pelanggan kami</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-primary dark:text-accent flex items-center gap-1 hover:gap-2 transition-all shrink-0">
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Galeri Foto / Carousel */}
      <Gallery />

      {/* SDG Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-primary rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl">
          <Star className="mx-auto mb-4 fill-accent text-accent" size={32} />
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3">Mendukung Sustainable Development Goals</h2>
          <p className="max-w-2xl mx-auto text-white/90 leading-relaxed">
            Setiap produk Moreleaf yang Anda beli turut mendukung kesehatan masyarakat, ekonomi yang layak,
            dan konsumsi yang bertanggung jawab — selaras dengan SDG 3, SDG 8, dan SDG 12.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;