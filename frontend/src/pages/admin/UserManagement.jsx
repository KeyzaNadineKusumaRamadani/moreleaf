import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Ban, CheckCircle2, Trash2, Search } from 'lucide-react';
import { userService } from '../../services';
import { formatDate } from '../../utils/format';
import { ConfirmDialog } from '../../components/admin/AdminUI';
import { EmptyState } from '../../components/common/Misc';
import { TableRowSkeleton } from '../../components/common/Skeletons';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Gagal memuat pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (user) => {
    try {
      await userService.block(user.id, !user.is_blocked);
      toast.success(user.is_blocked ? 'User berhasil dibuka blokirnya.' : 'User berhasil diblokir.');
      fetchUsers();
    } catch (error) {
      toast.error('Gagal memperbarui status user.');
    }
  };

  const handleDelete = async () => {
    try {
      await userService.delete(deleteTarget.id);
      toast.success('User berhasil dihapus.');
      setDeleteTarget(null);
      fetchUsers();
    } catch (error) {
      toast.error('Gagal menghapus user.');
    }
  };

  const filtered = users.filter(
    (u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-primary dark:text-accent mb-6">Kelola Pengguna</h1>

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-primary text-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">No HP</th>
                <th className="px-4 py-3 font-medium">Pesanan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Bergabung</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon="👥" title="Belum ada pengguna" /></td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">{u.phone || '-'}</td>
                    <td className="px-4 py-3">{u.total_orders}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {u.is_blocked ? 'Diblokir' : 'Aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleBlock(u)}
                          className={`p-2 rounded-lg ${u.is_blocked ? 'hover:bg-green-50 text-green-600' : 'hover:bg-yellow-50 text-yellow-600'}`}
                          aria-label={u.is_blocked ? 'Buka blokir' : 'Blokir'}
                        >
                          {u.is_blocked ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                        </button>
                        <button onClick={() => setDeleteTarget(u)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Hapus">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Pengguna?"
        message={`Apakah Anda yakin ingin menghapus pengguna "${deleteTarget?.name}"? Semua data terkait akan terhapus.`}
      />
    </div>
  );
};

export default UserManagement;
