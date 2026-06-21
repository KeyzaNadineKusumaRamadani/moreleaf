import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

// ===== EDIT DATA PEMBAYARAN DI SINI =====
const BANK_INFO = {
  bankName: 'BRI',
  accountNumber: '649101004536509',
  accountHolder: 'TALITHA ALYA AURELY',
};

// Ganti file qris.png di folder frontend/src/assets/qris.png dengan QRIS asli kamu
// =========================================

export const BankTransferInfo = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_INFO.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-3">
      <p className="text-sm font-semibold text-primary dark:text-accent mb-2">
        Transfer ke rekening berikut:
      </p>
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-3">
        <div>
          <p className="text-xs text-gray-500">{BANK_INFO.bankName}</p>
          <p className="font-display font-bold text-lg tracking-wide">{BANK_INFO.accountNumber}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">a.n. {BANK_INFO.accountHolder}</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-dark transition"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Setelah transfer, kirim bukti pembayaran melalui WhatsApp ke{' '}
        <a href="https://wa.me/6281615980113" target="_blank" rel="noopener noreferrer" className="text-primary dark:text-accent font-medium underline">
          081615980113
        </a>{' '}
        agar pesanan segera diproses.
      </p>
    </div>
  );
};

export const QrisInfo = () => {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-3">
      <p className="text-sm font-semibold text-primary dark:text-accent mb-3">
        Scan QRIS berikut untuk membayar:
      </p>
      <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-4">
        <img
          src="/qris.png"
          alt="QRIS Moreleaf"
          className="w-48 h-48 object-contain"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBkeT0iLjNlbSI+UVJJUyBiZWxhbSBkaXVwbG9hZDwvdGV4dD48L3N2Zz4=';
          }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Setelah membayar, pesanan akan diverifikasi otomatis oleh admin.
      </p>
    </div>
  );
};