export const formatCurrency = (amount) => {
  return `Rp${Number(amount).toLocaleString('id-ID')}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${apiBase}${path}`;
};

export const statusLabels = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  diproses: { label: 'Diproses', color: 'bg-blue-100 text-blue-700' },
  dikemas: { label: 'Dikemas', color: 'bg-purple-100 text-purple-700' },
  dikirim: { label: 'Dikirim', color: 'bg-indigo-100 text-indigo-700' },
  selesai: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
  dibatalkan: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
};

export const statusOrder = ['pending', 'diproses', 'dikemas', 'dikirim', 'selesai'];
