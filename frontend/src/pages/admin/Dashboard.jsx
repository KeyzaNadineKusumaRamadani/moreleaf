import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Package, Users, ShoppingBag, DollarSign, Star, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { userService, orderService } from '../../services';
import { downloadExport } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { StatCard } from '../../components/admin/AdminUI';
import { PageLoader } from '../../components/common/Skeletons';
import '../../utils/chartSetup';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingOrders, setExportingOrders] = useState(false);
  const [exportingProducts, setExportingProducts] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, orderStatsRes] = await Promise.all([
          userService.getDashboardStats(),
          orderService.getStats(),
        ]);
        setStats(statsRes.data.data);
        setOrderStats(orderStatsRes.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportOrders = async () => {
    setExportingOrders(true);
    try {
      await downloadExport('orders', 'pesanan-moreleaf.xlsx');
    } catch (error) {
      toast.error('Gagal mengekspor data pesanan.');
    } finally {
      setExportingOrders(false);
    }
  };

  const handleExportProducts = async () => {
    setExportingProducts(true);
    try {
      await downloadExport('products', 'produk-moreleaf.xlsx');
    } catch (error) {
      toast.error('Gagal mengekspor data produk.');
    } finally {
      setExportingProducts(false);
    }
  };

  if (loading) return <PageLoader />;

  const dailyLabels = orderStats?.dailySales?.map((d) =>
    new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  ) || [];
  const dailyData = orderStats?.dailySales?.map((d) => Number(d.total)) || [];

  const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const monthlyLabels = orderStats?.monthlySales?.map((m) => `${monthNames[m.month - 1]} ${m.year}`).reverse() || [];
  const monthlyData = orderStats?.monthlySales?.map((m) => Number(m.total)).reverse() || [];

  const topProductLabels = orderStats?.topProducts?.map((p) => p.name) || [];
  const topProductData = orderStats?.topProducts?.map((p) => p.total_sold) || [];

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { callback: (v) => `${(v / 1000).toFixed(0)}k` }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  const barOptions = {
    responsive: true,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { grid: { color: 'rgba(0,0,0,0.05)' } }, y: { grid: { display: false } } },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl text-primary dark:text-accent">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportOrders}
            disabled={exportingOrders}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            <Download size={14} /> {exportingOrders ? 'Mengunduh...' : 'Export Pesanan'}
          </button>
          <button
            onClick={handleExportProducts}
            disabled={exportingProducts}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            <Download size={14} /> {exportingProducts ? 'Mengunduh...' : 'Export Produk'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={Package} label="Total Produk" value={stats?.total_products || 0} />
        <StatCard icon={Users} label="Total User" value={stats?.total_users || 0} />
        <StatCard icon={ShoppingBag} label="Total Pesanan" value={stats?.total_orders || 0} />
        <StatCard icon={DollarSign} label="Total Penjualan" value={formatCurrency(stats?.total_sales || 0)} />
        <StatCard icon={Star} label="Total Review" value={stats?.total_reviews || 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-display font-semibold mb-4">Penjualan Harian (30 Hari Terakhir)</h2>
          {dailyData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">Belum ada data penjualan.</p>
          ) : (
            <Line
              data={{
                labels: dailyLabels,
                datasets: [{
                  label: 'Penjualan',
                  data: dailyData,
                  borderColor: '#14532D',
                  backgroundColor: 'rgba(20,83,45,0.1)',
                  fill: true,
                  tension: 0.4,
                }],
              }}
              options={lineOptions}
            />
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-display font-semibold mb-4">Penjualan Bulanan</h2>
          {monthlyData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">Belum ada data penjualan.</p>
          ) : (
            <Line
              data={{
                labels: monthlyLabels,
                datasets: [{
                  label: 'Penjualan',
                  data: monthlyData,
                  borderColor: '#1F6B3A',
                  backgroundColor: 'rgba(31,107,58,0.1)',
                  fill: true,
                  tension: 0.4,
                }],
              }}
              options={lineOptions}
            />
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h2 className="font-display font-semibold mb-4">Produk Terlaris</h2>
        {topProductData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">Belum ada data penjualan.</p>
        ) : (
          <Bar
            data={{
              labels: topProductLabels,
              datasets: [{
                label: 'Terjual',
                data: topProductData,
                backgroundColor: '#6FA888',
                borderRadius: 6,
              }],
            }}
            options={barOptions}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;