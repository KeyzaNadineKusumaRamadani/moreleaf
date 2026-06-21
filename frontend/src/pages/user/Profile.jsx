import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Camera, User, Phone, MapPin, Save } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/format';
import { Seo } from '../../components/common/Misc';
import { PageLoader } from '../../components/common/Skeletons';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef();

  const fetchProfile = async () => {
    try {
      const res = await authService.getProfile();
      const data = res.data.data;
      const defaultAddress = data.addresses?.[0] || {};
      reset({
        name: data.name,
        phone: data.phone,
        province: defaultAddress.province || '',
        city: defaultAddress.city || '',
        postal_code: defaultAddress.postal_code || '',
        address: defaultAddress.address || '',
      });
      setAvatarPreview(data.avatar ? getImageUrl(data.avatar) : null);
    } catch (error) {
      toast.error('Gagal memuat profil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value || ''));
      if (avatarFile) formData.append('avatar', avatarFile);

      await authService.updateProfile(formData);
      updateUser({ name: data.name, phone: data.phone });
      toast.success('Profil berhasil diperbarui!');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Seo title="Profil Saya" />
      <h1 className="font-display font-bold text-3xl text-primary dark:text-accent mb-8">Profil Saya</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-primary dark:text-accent" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-dark transition"
              aria-label="Ubah foto profil"
            >
              <Camera size={14} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          <div>
            <p className="font-display font-semibold text-lg">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nama Lengkap</label>
              <input
                {...register('name', { required: 'Nama wajib diisi' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">No HP</label>
              <input
                {...register('phone')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input
              value={user?.email}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-400"
            />
          </div>

          <h3 className="font-display font-semibold pt-4 flex items-center gap-2">
            <MapPin size={16} /> Alamat
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Provinsi</label>
              <input
                {...register('province')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Kota</label>
              <input
                {...register('city')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Kode Pos</label>
            <input
              {...register('postal_code')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Alamat Lengkap</label>
            <textarea
              {...register('address')}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} /> {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
