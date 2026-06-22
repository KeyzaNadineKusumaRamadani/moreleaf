import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';

// Ikon TikTok custom (lucide-react belum punya ikon TikTok resmi)
const TikTokIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.49 1.5V7.46c-1.51.04-2.94-.71-3.43-1.64Z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-gradient-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-display font-bold text-xl mb-3">
              <span className="text-2xl">🌿</span> MORELEAF
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Healthy Snack From Moringa Leaves. Camilan sehat berbahan dasar daun kelor organik untuk semua kalangan.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/about" className="hover:text-accent transition">Tentang Kami</Link></li>
              <li><Link to="/products" className="hover:text-accent transition">Produk</Link></li>
              <li><Link to="/testimonials" className="hover:text-accent transition">Testimoni</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition">Kontak</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Kontak Kami</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2"><Phone size={14} /> 081615980113</li>
              <li className="flex items-center gap-2"><Mail size={14} /> moreleaf.bakery@gmail.com</li>
              <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> Sawojajar, Kedungkandang, Malang</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Ikuti Kami</h4>
            <div className="flex gap-3">
              <a
                href="https://wa.me/6281615980113"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Moreleaf"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-primary transition"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="https://www.instagram.com/more.leaf?igsh=MXBuYnhzM3lxN2NmbQ=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Moreleaf"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-primary transition"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@more.leaf?_r=1&_t=ZS-97MzU89KYdh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Moreleaf"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-primary transition"
              >
                <TikTokIcon size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-white/70">
          © {new Date().getFullYear()} Moreleaf. Mendukung SDG 3, 8, dan 12. Dibuat dengan 💚 untuk Indonesia sehat.
        </div>
      </div>
    </footer>
  );
};

export default Footer;