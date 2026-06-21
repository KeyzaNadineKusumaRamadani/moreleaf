import { Link } from 'react-router-dom';
import { Seo } from '../../components/common/Misc';

const NotFound = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
    <Seo title="Halaman Tidak Ditemukan" />
    <div>
      <div className="text-6xl mb-4">🍃</div>
      <h1 className="font-display font-bold text-3xl text-primary dark:text-accent mb-2">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-gray-500 mb-6">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
      <Link to="/" className="inline-block px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition">
        Kembali ke Beranda
      </Link>
    </div>
  </div>
);

export default NotFound;
