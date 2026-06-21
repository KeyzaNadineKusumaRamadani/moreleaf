import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon, Camera } from 'lucide-react';

// ====== EDIT FOTO GALERI DI SINI ======
// Taruh file foto kamu di folder frontend/public/gallery/
// lalu daftarkan nama filenya di array ini.
const galleryItems = [
  { src: '/gallery/dikemas.jpeg', caption: 'Produk Moreleaf yang sudah dikemas' },
  { src: '/gallery/jualan1.jpeg', caption: 'Produk Moreleaf dijual langsung' },
  { src: '/gallery/jualan2.jpeg', caption: 'Foto produk Moreleaf' },
  { src: '/gallery/live.jpeg', caption: 'Live jualan di Instagram' },
  { src: '/gallery/foto.jpeg', caption: 'Kerjasama Moreleaf' },
  { src: '/gallery/BROWNIES.jpeg', caption: 'Proses oven brownies dari Moreleaf' },
  { src: '/gallery/muffin.jpeg', caption: 'Produk muffin dari Moreleaf' },
  { src: '/gallery/COOKIESB.jpeg', caption: 'Produk Moreleaf yang sudah dikemas' },
];
// ========================================

const tagStyles = {
  Produk: 'bg-primary text-white',
  Proses: 'bg-secondary text-white',
  'Live Jualan': 'bg-red-500 text-white',
};

const GalleryCard = ({ item }) => {
  const [error, setError] = useState(false);

  return (
    <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-primary via-secondary to-accent shadow-md hover:shadow-xl transition-shadow duration-300 h-full">
      <div className="bg-gradient-to-b from-white to-accent/10 dark:from-gray-800 dark:to-gray-800 rounded-[14px] overflow-hidden h-full flex flex-col">
        <div className="aspect-square relative overflow-hidden">
          {!error ? (
            <img
              src={item.src}
              alt={item.caption}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={() => setError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-primary/40 bg-gradient-to-br from-white to-accent/20 dark:from-gray-700 dark:to-gray-800">
              <ImageIcon size={36} />
              <span className="text-xs px-3 text-center">Foto belum diupload</span>
            </div>
          )}
          {item.tag && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold ${tagStyles[item.tag] || 'bg-primary text-white'} shadow-sm`}>
              {item.tag}
            </span>
          )}
        </div>
        <div className="p-3 flex-1 flex items-center bg-white dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-2">{item.caption}</p>
        </div>
      </div>
    </div>
  );
};

const Gallery = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-soft text-primary dark:text-accent rounded-full text-xs font-semibold mb-3">
            <Camera size={13} /> Galeri
          </span>
          <h2 className="font-display font-bold text-3xl text-primary dark:text-accent mb-1">Galeri Moreleaf</h2>
          <p className="text-gray-500">Momen produksi, live jualan, dan produk favorit kami</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            aria-label="Geser kiri"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            aria-label="Geser kanan"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-3 scroll-smooth snap-x"
        style={{ scrollbarWidth: 'none' }}
      >
        {galleryItems.map((item, i) => (
          <div key={i} className="w-60 sm:w-64 shrink-0 snap-start">
            <GalleryCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;