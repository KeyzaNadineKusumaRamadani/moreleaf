import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Trash2, Reply, Mail, Search } from 'lucide-react';
import { contactService } from '../../services';
import { formatDateTime } from '../../utils/format';
import { Modal, ConfirmDialog } from '../../components/admin/AdminUI';
import { EmptyState } from '../../components/common/Misc';
import { TableRowSkeleton } from '../../components/common/Skeletons';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactService.getAll();
      setContacts(res.data.data);
    } catch (error) {
      toast.error('Gagal memuat pesan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const openReply = (contact) => {
    setReplyTarget(contact);
    setReplyText(contact.admin_reply || '');
  };

  const submitReply = async () => {
    setSubmitting(true);
    try {
      await contactService.reply(replyTarget.id, replyText);
      toast.success('Balasan berhasil dikirim.');
      setReplyTarget(null);
      fetchContacts();
    } catch (error) {
      toast.error('Gagal mengirim balasan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await contactService.delete(deleteTarget.id);
      toast.success('Pesan berhasil dihapus.');
      setDeleteTarget(null);
      fetchContacts();
    } catch (error) {
      toast.error('Gagal menghapus pesan.');
    }
  };

  const filtered = contacts.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-primary dark:text-accent mb-6">Pesan Masuk</h1>

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-primary text-sm"
        />
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full"><tbody>{Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={1} />)}</tbody></table>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="✉️" title="Belum ada pesan masuk" />
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div key={c.id} className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm ${!c.is_read ? 'ring-2 ring-primary/20' : ''}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{c.name}</span>
                    {!c.is_read && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail size={12} /> {c.email}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{c.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(c.created_at)}</p>
                  {c.admin_reply && (
                    <div className="mt-3 bg-primary/5 rounded-xl p-3 text-sm">
                      <p className="font-semibold text-primary dark:text-accent mb-1">Balasan Anda:</p>
                      <p className="text-gray-600 dark:text-gray-300">{c.admin_reply}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openReply(c)} className="p-2 rounded-lg hover:bg-primary/10 text-primary dark:text-accent" aria-label="Balas">
                    <Reply size={16} />
                  </button>
                  <button onClick={() => setDeleteTarget(c)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!replyTarget} onClose={() => setReplyTarget(null)} title="Balas Pesan">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">"{replyTarget?.message}"</p>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={4}
            placeholder="Tulis balasan Anda..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary resize-none"
          />
          <button
            onClick={submitReply}
            disabled={submitting}
            className="w-full py-2.5 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary-dark transition disabled:opacity-50"
          >
            {submitting ? 'Mengirim...' : 'Kirim Balasan'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Pesan?"
        message="Apakah Anda yakin ingin menghapus pesan ini?"
      />
    </div>
  );
};

export default ContactManagement;
