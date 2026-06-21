import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Trash2, MessageSquare, Search } from 'lucide-react';
import { reviewService } from '../../services';
import { formatDate } from '../../utils/format';
import { RatingStars } from '../../components/common/RatingStars';
import { Modal, ConfirmDialog } from '../../components/admin/AdminUI';
import { EmptyState } from '../../components/common/Misc';
import { TableRowSkeleton } from '../../components/common/Skeletons';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getAll();
      setReviews(res.data.data);
    } catch (error) {
      toast.error('Gagal memuat ulasan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openReply = (review) => {
    setReplyTarget(review);
    setReplyText(review.admin_reply || '');
  };

  const submitReply = async () => {
    setSubmitting(true);
    try {
      await reviewService.update(replyTarget.id, { admin_reply: replyText });
      toast.success('Balasan berhasil dikirim.');
      setReplyTarget(null);
      fetchReviews();
    } catch (error) {
      toast.error('Gagal mengirim balasan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await reviewService.delete(deleteTarget.id);
      toast.success('Ulasan berhasil dihapus.');
      setDeleteTarget(null);
      fetchReviews();
    } catch (error) {
      toast.error('Gagal menghapus ulasan.');
    }
  };

  const filtered = reviews.filter(
    (r) => !search || r.product_name?.toLowerCase().includes(search.toLowerCase()) || r.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-primary dark:text-accent mb-6">Kelola Ulasan</h1>

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk atau user..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-primary text-sm"
        />
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full"><tbody>{Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={1} />)}</tbody></table>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="⭐" title="Belum ada ulasan" />
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{r.user_name || 'Pengguna'}</span>
                    <span className="text-gray-400 text-xs">·</span>
                    <span className="text-secondary text-sm font-medium">{r.product_name}</span>
                  </div>
                  <RatingStars rating={r.rating} size={14} />
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(r.created_at)}</p>
                  {r.admin_reply && (
                    <div className="mt-3 bg-primary/5 rounded-xl p-3 text-sm">
                      <p className="font-semibold text-primary dark:text-accent mb-1">Balasan Anda:</p>
                      <p className="text-gray-600 dark:text-gray-300">{r.admin_reply}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openReply(r)} className="p-2 rounded-lg hover:bg-primary/10 text-primary dark:text-accent" aria-label="Balas">
                    <MessageSquare size={16} />
                  </button>
                  <button onClick={() => setDeleteTarget(r)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!replyTarget} onClose={() => setReplyTarget(null)} title="Balas Ulasan">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">"{replyTarget?.comment}"</p>
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
        title="Hapus Ulasan?"
        message="Apakah Anda yakin ingin menghapus ulasan ini?"
      />
    </div>
  );
};

export default ReviewManagement;
