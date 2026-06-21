import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Mail, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { Seo } from '../../components/common/Misc';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: otp+password
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm();
  const resetForm = useForm();

  const handleSendOTP = async (data) => {
    setSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setEmail(data.email);
      toast.success('Kode OTP telah dikirim ke email Anda.');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (data) => {
    setSubmitting(true);
    try {
      await authService.resetPassword({ email, otp: data.otp, newPassword: data.newPassword });
      toast.success('Password berhasil direset! Silakan login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mereset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 leaf-pattern-bg">
      <Seo title="Lupa Password" />
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-primary dark:text-accent mb-2">
            🌿 MORELEAF
          </Link>
          <p className="text-gray-500 text-sm">
            {step === 1 ? 'Masukkan email untuk reset password' : 'Masukkan kode OTP dan password baru'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={emailForm.handleSubmit(handleSendOTP)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  {...emailForm.register('email', { required: 'Email wajib diisi' })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
                  placeholder="email@contoh.com"
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition disabled:opacity-50"
            >
              {submitting ? 'Mengirim...' : 'Kirim Kode OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Kode OTP</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...resetForm.register('otp', { required: 'Kode OTP wajib diisi' })}
                  maxLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary tracking-widest"
                  placeholder="123456"
                />
              </div>
              {resetForm.formState.errors.otp && (
                <p className="text-red-500 text-xs mt-1">{resetForm.formState.errors.otp.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password Baru</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...resetForm.register('newPassword', { required: 'Password wajib diisi', minLength: { value: 6, message: 'Minimal 6 karakter' } })}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-primary"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {resetForm.formState.errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{resetForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition disabled:opacity-50"
            >
              {submitting ? 'Memproses...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-500 hover:text-primary transition"
            >
              ← Kembali, ganti email
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Ingat password Anda?{' '}
          <Link to="/login" className="text-primary dark:text-accent font-semibold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
