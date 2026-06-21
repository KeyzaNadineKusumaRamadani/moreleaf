import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle2, Download, Package } from 'lucide-react';
import { downloadInvoice } from '../../services/api';
import { Seo } from '../../components/common/Misc';

const OrderSuccess = () => {
  const { id } = useParams();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      await downloadInvoice(id);
    } catch (error) {
      toast.error('Gagal mengunduh invoice.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <Seo title="Pesanan Berhasil" />
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={40} className="text-primary dark:text-accent" />
      </div>
      <h1 className="font-display font-bold text-3xl text-primary dark:text-accent mb-3">
        Terima kasih, pesanan berhasil dibuat.
      </h1>
      <p className="text-gray-500 mb-2">Nomor pesanan Anda:</p>
      <p className="font-display font-bold text-2xl mb-8">#{id}</p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to={`/orders/${id}`}
          className="px-6 py-3 bg-gradient-primary text-white rounded-full font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Package size={18} /> Lacak Pesanan
        </Link>
        <button
          onClick={handleDownloadInvoice}
          disabled={downloading}
          className="px-6 py-3 border-2 border-primary text-primary dark:text-accent dark:border-accent rounded-full font-medium hover:bg-primary/5 transition flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={18} /> {downloading ? 'Mengunduh...' : 'Unduh Invoice'}
        </button>
      </div>

      <Link to="/products" className="inline-block mt-8 text-sm text-gray-500 hover:text-primary transition">
        ← Kembali Belanja
      </Link>
    </div>
  );
};

export default OrderSuccess;