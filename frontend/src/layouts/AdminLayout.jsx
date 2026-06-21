import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Users, Star,
  MessageSquare, LogOut, Menu, X, Bell, Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import { notificationService } from '../services';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'react-toastify';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Produk' },
  { to: '/admin/categories', icon: Tags, label: 'Kategori' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Pesanan' },
  { to: '/admin/users', icon: Users, label: 'Pengguna' },
  { to: '/admin/reviews', icon: Star, label: 'Ulasan' },
  { to: '/admin/contacts', icon: MessageSquare, label: 'Pesan Masuk' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.data);
      setUnreadCount(res.data.unread_count);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useSocket((notif) => {
    toast.info(`${notif.title}: ${notif.message}`);
    fetchNotifications();
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleNotif = () => {
    setNotifOpen((prev) => !prev);
  };

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await notificationService.markRead(notif.id);
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error(error);
      }
    }

    setNotifOpen(false);
    if (notif.type === 'order') navigate('/admin/orders');
    else if (notif.type === 'review') navigate('/admin/reviews');
    else if (notif.type === 'contact') navigate('/admin/contacts');
    else if (notif.type === 'user') navigate('/admin/users');
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(unread.map((n) => notificationService.markRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      toast.error('Gagal menandai semua sebagai dibaca.');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 bg-gradient-primary text-white z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-white/10 font-display font-bold text-lg">
          {!logoError ? (
            <img
              src="/logo.jpg"
              alt="Moreleaf"
              className="h-9 w-9 object-cover rounded-lg ring-2 ring-white/20"
              onError={() => setLogoError(true)}
            />
          ) : (
            <Leaf size={22} />
          )}
          MORELEAF
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  active ? 'bg-white text-primary shadow-sm' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                <item.icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/85 hover:bg-white/10 w-full"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 h-16 flex items-center justify-between px-4 sm:px-6">
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <Menu size={22} />
          </button>
          <h1 className="font-display font-semibold text-lg hidden sm:block">Admin Panel</h1>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={toggleNotif}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Notifikasi"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center pointer-events-none">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 animate-fade-in z-50">
                  <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                    <span className="font-semibold text-sm">Notifikasi</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        disabled={markingAll}
                        className="text-xs text-primary dark:text-accent font-medium hover:underline disabled:opacity-50"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-400 text-center">Belum ada notifikasi</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        type="button"
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                          !n.is_read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium">{n.title}</p>
                          {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />}
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;