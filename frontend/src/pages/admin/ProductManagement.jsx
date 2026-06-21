import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import { productService, categoryService } from '../../services/productService';
import { formatCurrency, getImageUrl } from '../../utils/format';
import { Modal, ConfirmDialog } from '../../components/admin/AdminUI';
import { EmptyState } from '../../components/common/Misc';
import { TableRowSkeleton } from '../../components/common/Skeletons';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ search, limit: 100 });
      setProducts(res.data.data);
    } catch (error) {
      toast.error('Gagal memuat produk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', category_id: '', description: '', composition: '', benefits: '', price: '', stock: '' });
    setImagePreview(null);
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    reset({
      name: product.name,
      category_id: product.category_id,
      description: product.description,
      composition: product.composition,
      benefits: product.benefits,
      price: product.price,
      stock: product.stock,
    });
    setImagePreview(product.image ? getImageUrl(product.image) : null);
    setImageFile(null);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      if (imageFile) formData.append('image', imageFile);

      if (editing) {
        await productService.update(editing.id, formData);
        toast.success('Produk berhasil diperbarui.');
      } else {
        await productService.create(formData);
        toast.success('Produk berhasil ditambahkan.');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan produk.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await productService.delete(deleteTarget.id);
      toast.success('Produk berhasil dihapus.');
      setDeleteTarget(null);
      fetchProducts();
    } catch (error) {
      toast.error('Gagal menghapus produk.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl text-primary dark:text-accent">Kelola Produk</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition"
        >
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk..."
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-primary text-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Harga</th>
                <th className="px-4 py-3 font-medium">Stok</th>
                <th className="px-4 py-3 font-medium">Terjual</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : products.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon="📦" title="Belum ada produk" /></td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 overflow-hidden flex items-center justify-center shrink-0">
                          {p.image ? <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-gray-400" />}
                        </div>
                        <span className="font-medium line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category_name || '-'}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock <= 5 ? 'text-red-500 font-medium' : ''}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.sold || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-primary/10 text-primary dark:text-accent" aria-label="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Hapus">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Produk' : 'Tambah Produk'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-accent/10 overflow-hidden flex items-center justify-center shrink-0">
              {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-400" />}
            </div>
            <div>
              <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition inline-block">
                Upload Gambar
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nama Produk</label>
              <input {...register('name', { required: 'Wajib diisi' })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Kategori</label>
              <select {...register('category_id', { required: 'Wajib dipilih' })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary">
                <option value="">Pilih kategori</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Harga (Rp)</label>
              <input type="number" {...register('price', { required: 'Wajib diisi' })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Stok</label>
              <input type="number" {...register('stock', { required: 'Wajib diisi' })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary" />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Deskripsi</label>
            <textarea {...register('description')} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Komposisi</label>
            <textarea {...register('composition')} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Manfaat</label>
            <textarea {...register('benefits')} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 font-medium text-sm">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary-dark transition disabled:opacity-50">
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Produk?"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};

export default ProductManagement;
