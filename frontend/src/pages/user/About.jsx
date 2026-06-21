import { CheckCircle2, Sparkles } from 'lucide-react';
import { Seo } from '../../components/common/Misc';

const advantages = [
  'Kaya zat besi',
  'Tinggi protein',
  'Tinggi kalsium',
  'Mengandung vitamin C',
  'Produk lokal Indonesia',
  'Tanpa pewarna buatan',
];

const benefits = [
  'Membantu memenuhi kebutuhan nutrisi',
  'Mendukung pola hidup sehat',
  'Cocok untuk vegetarian',
  'Cocok untuk anak-anak',
  'Cocok untuk penderita anemia ringan',
];

const About = () => {
  return (
    <div>
      <Seo title="Tentang Kami" description="Moreleaf adalah UMKM yang memproduksi makanan sehat berbahan dasar daun kelor organik." />

      <section className="leaf-pattern-bg py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-accent/20 text-primary dark:text-accent rounded-full text-xs font-semibold mb-5">
            Apa itu Moreleaf
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-primary dark:text-accent mb-4">Tentang Kami</h1>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            Moreleaf adalah UMKM yang memproduksi makanan sehat berbahan dasar daun kelor organik yang kaya nutrisi
            seperti zat besi, protein, kalsium, dan vitamin C.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary dark:text-accent flex items-center justify-center mb-4">
            <Sparkles size={22} />
          </div>
          <h2 className="font-display font-bold text-xl mb-2">Visi</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Menjadi pelopor makanan sehat berbasis daun kelor di Indonesia.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary dark:text-accent flex items-center justify-center mb-4">
            <CheckCircle2 size={22} />
          </div>
          <h2 className="font-display font-bold text-xl mb-2">Misi</h2>
          <ul className="text-gray-600 dark:text-gray-300 space-y-1.5 leading-relaxed">
            <li>• Meningkatkan kesadaran gizi masyarakat</li>
            <li>• Mengembangkan produk sehat berbahan lokal</li>
            <li>• Memberdayakan petani lokal</li>
            <li>• Mendukung Sustainable Development Goals (SDGs)</li>
          </ul>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display font-bold text-2xl text-primary dark:text-accent mb-6">Keunggulan Produk</h2>
            <div className="space-y-3">
              {advantages.map((a, i) => (
                <div key={i} className="flex items-center gap-3 bg-cream dark:bg-gray-800 rounded-xl px-4 py-3">
                  <CheckCircle2 size={18} className="text-secondary shrink-0" />
                  <span className="text-sm font-medium">{a}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-primary dark:text-accent mb-6">Manfaat Bagi Anda</h2>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3 bg-cream dark:bg-gray-800 rounded-xl px-4 py-3">
                  <CheckCircle2 size={18} className="text-secondary shrink-0" />
                  <span className="text-sm font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
