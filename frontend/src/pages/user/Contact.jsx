import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Phone, MessageCircle, MapPin, Send, Instagram } from 'lucide-react';
import { contactService } from '../../services';
import { Seo } from '../../components/common/Misc';

const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.49 1.5V7.46c-1.51.04-2.94-.71-3.43-1.64Z"/>
  </svg>
);

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await contactService.send(data);
      toast.success('Pesan Anda berhasil dikirim. Terima kasih!');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim pesan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo title="Kontak Kami" description="Hubungi Moreleaf untuk pertanyaan, pemesanan, atau kerja sama." />

      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-3xl text-primary dark:text-accent mb-2">Hubungi Kami</h1>
        <p className="text-gray-500">Kami siap membantu Anda</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <div className="space-y-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-soft text-primary dark:text-accent flex items-center justify-center shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <p className="font-medium">Telepon</p>
                <p className="text-sm text-gray-500">081615980113</p>
              </div>
            </div>
            <a
              href="https://wa.me/6281615980113"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-soft text-primary dark:text-accent flex items-center justify-center shrink-0">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="font-medium">WhatsApp</p>
                <p className="text-sm text-gray-500">Chat langsung dengan kami</p>
              </div>
            </a>
            <a
              href="https://www.instagram.com/more.leaf?igsh=MWxtZ3FoeWR1Ynlhaw=="
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-soft text-primary dark:text-accent flex items-center justify-center shrink-0">
                <Instagram size={20} />
              </div>
              <div>
                <p className="font-medium">Instagram</p>
                <p className="text-sm text-gray-500">@more.leaf</p>
              </div>
            </a>
            <a
              href="https://www.tiktok.com/@more.leaf?_r=1&_t=ZS-97MzU89KYdh"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-soft text-primary dark:text-accent flex items-center justify-center shrink-0">
                <TikTokIcon size={18} />
              </div>
              <div>
                <p className="font-medium">TikTok</p>
                <p className="text-sm text-gray-500">@more.leaf</p>
              </div>
            </a>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gradient-soft text-primary dark:text-accent flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="font-medium">Lokasi</p>
                <p className="text-sm text-gray-500">Sawojajar, Kedungkandang, Malang, Jawa Timur</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-sm h-64">
            <iframe
              title="Lokasi Moreleaf - Sawojajar, Kedungkandang, Malang"
              src="https://www.google.com/maps?q=Sawojajar,+Kedungkandang,+Malang,+Jawa+Timur&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="font-display font-semibold text-lg mb-5">Kirim Pesan</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nama</label>
              <input
                {...register('name', { required: 'Nama wajib diisi' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email wajib diisi' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Pesan</label>
              <textarea
                rows={5}
                {...register('message', { required: 'Pesan wajib diisi' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary resize-none"
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-primary text-white rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={16} /> {submitting ? 'Mengirim...' : 'Kirim Pesan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;