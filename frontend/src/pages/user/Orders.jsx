import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Download } from 'lucide-react';
import { orderService } from '../../services';
import { formatCurrency, formatDate, statusLabels } from '../../utils/format';
import { EmptyState, Seo } from '../../components/common/Misc';
import { PageLoader } from '../../components/common/Skeletons';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await orderService.getAll(filter ? { status: filter } : {});
        setOrders(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [filter]);

  const filters = [
    { value: '', label: 'Semua' },
    { value: 'pending', label: 'Pending' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'dikirim', label: 'Dikirim' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo title="Pesanan Saya" />
      <h1 className="font-display font-bold text-3xl text-primary dark:text-accent mb-6">Pesanan Saya</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === f.value ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Belum ada pesanan"
          description="Pesanan Anda akan muncul di sini setelah Anda berbelanja."
          action={
            <Link to="/products" className="inline-block px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition">
              Mulai Belanja
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-primary dark:text-accent" />
                  <span className="font-display font-semibold">Pesanan #{order.id}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[order.status]?.color}`}>
                  {statusLabels[order.status]?.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{order.item_count} produk · {formatDate(order.created_at)}</span>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-primary dark:text-accent">{formatCurrency(order.total_price)}</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
