import { PlayCircle, Sprout, Lightbulb, HeartPulse } from 'lucide-react';

// ====== EDIT VIDEO YOUTUBE DI SINI ======
// Cara dapat ID: dari URL youtube.com/watch?v=XXXXXXX, ambil bagian XXXXXXX setelah v=
const VIDEOS = [
  {
    id: 'KufpquRW_cQ',
    title: 'Manfaat & Tips Konsumsi Daun Kelor',
    desc: 'Kandungan nutrisi daun kelor dan cara terbaik mengonsumsinya.',
    icon: PlayCircle,
  },
  {
    id: 'BnrboxFvv_Y',
    title: 'Kelor untuk Kolesterol & Jantung',
    desc: 'Bagaimana daun kelor membantu menjaga kesehatan jantung dan kolesterol.',
    icon: HeartPulse,
  },
  {
    id: '5rhZNwDPVqc',
    title: 'Inovasi Olahan Berbahan Daun Kelor',
    desc: 'Contoh inovasi produk makanan tambahan berbasis daun kelor.',
    icon: Lightbulb,
  },
  {
    id: 'W_HI4hu7Ze0',
    title: 'Cara Budidaya Tanaman Kelor',
    desc: 'Mengenal cara menanam dan merawat pohon kelor dari biji.',
    icon: Sprout,
  },
];
// ==========================================

const VideoSection = () => {
  return (
    <section className="bg-white dark:bg-gray-800/40 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-soft text-primary dark:text-accent rounded-full text-xs font-semibold mb-4">
            <PlayCircle size={14} /> Edukasi
          </span>
          <h2 className="font-display font-bold text-3xl text-primary dark:text-accent mb-2">
            Kenali Lebih Dekat Daun Kelor
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Yuk simak video-video berikut untuk memahami tanaman kelor, manfaat kesehatannya, dan beragam inovasi olahannya.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {VIDEOS.map((video) => (
            <div key={video.id} className="rounded-2xl p-[2px] bg-gradient-to-br from-primary via-secondary to-accent shadow-sm hover:shadow-lg transition-shadow">
              <div className="bg-white dark:bg-gray-800 rounded-[14px] overflow-hidden h-full flex flex-col">
                <div className="aspect-video bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <video.icon size={16} className="text-primary dark:text-accent shrink-0" />
                    <h3 className="font-display font-semibold text-sm leading-tight">{video.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{video.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;