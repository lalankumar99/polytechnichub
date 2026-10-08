import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  PhoneCall,
  MessageCircle,
  Camera,
  Upload,
  User,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface PremiumPortalProps {
  onLoginSuccess: (user: any) => void;
  onClose: () => void;
}

export const PremiumPortal: React.FC<PremiumPortalProps> = ({ onLoginSuccess, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'success'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhoto, setRegPhoto] = useState<string>('');

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Handle Photo selection & conversion to Base64
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError('Please select an image smaller than 4MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRegPhoto(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!regName.trim() || !regEmail.trim() || !regMobile.trim() || !regPassword.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await api.registerPremiumUser({
        name: regName.trim(),
        email: regEmail.trim(),
        mobile: regMobile.trim(),
        password: regPassword,
        photoUrl: regPhoto || ''
      });
      setMode('success');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await api.loginPremiumUser({
        identifier: loginId.trim(),
        password: loginPassword
      });

      // Check if user is approved
      if (user.status !== 'approved') {
        setError('Your account is pending admin approval. You will be able to log in once approved by the administrator.');
        setLoading(false);
        return;
      }

      // Persist session to localStorage
      localStorage.setItem('polytechnic_premium_user', JSON.stringify(user));
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative my-auto sm:my-8 border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 p-5 sm:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black">Polytechnic Premium</h2>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 tracking-wider uppercase">
                Official Student Portal
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-indigo-100 opacity-90 mt-1">
            {mode === 'login'
              ? 'Log in to unlock exclusive courses and materials'
              : mode === 'register'
              ? 'Register with your student details and original photo for Admin Approval'
              : 'Application Submitted for Admin Approval'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-8 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-2xl flex items-start space-x-3 text-xs sm:text-sm font-semibold border border-rose-200 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Mode 1: Success State after Registration */}
          {mode === 'success' ? (
            <div className="text-center py-4 space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Approval Request Sent to Admin!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Your registration details and profile have been securely sent to the Polytechnic Hub Admin.
                  <strong> Once the admin verifies and approves your request</strong>, your account will be activated and you can log in immediately.
                </p>
              </div>

              {/* Student Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left flex items-center space-x-4 max-w-sm mx-auto">
                {regPhoto ? (
                  <img
                    src={regPhoto}
                    alt={regName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {regName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{regName}</h4>
                  <p className="text-xs text-slate-500 truncate">{regEmail}</p>
                  <div className="inline-flex items-center space-x-1 mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Status: Pending Approval</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 max-w-sm mx-auto pt-2">
                <a
                  href={`https://wa.me/919296783086?text=Hello%20Admin,%20I%20have%20registered%20for%20Premium%20access%20on%20Polytechnic%20Hub.%20My%20name%20is%20${encodeURIComponent(regName)}%20and%20Mobile%20is%20${encodeURIComponent(regMobile)}.%20Please%20approve%20my%20account.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Notify Admin on WhatsApp</span>
                </a>
                <a
                  href="tel:+919296783086"
                  className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Admin for Instant Approval</span>
                </a>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Go to Login Screen
                </button>
              </div>
            </div>
          ) : mode === 'register' ? (
            /* Mode 2: Student Registration Form */
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Profile Photo Uploader */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-indigo-100 shadow-md bg-slate-100 flex items-center justify-center">
                    {regPhoto ? (
                      <img
                        src={regPhoto}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  
                  <label
                    htmlFor="student-photo-upload"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 cursor-pointer border-2 border-white"
                    title="Upload original profile photo"
                  >
                    <Camera className="w-4 h-4" />
                  </label>
                  <input
                    id="student-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <label htmlFor="student-photo-upload" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2 cursor-pointer">
                  {regPhoto ? 'Change Profile Photo' : 'Upload Student Profile Photo'}
                </label>
                <span className="text-[10px] text-slate-400">
                  (This will show in the header after login)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 sm:py-3 text-base sm:text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 sm:py-3 text-base sm:text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="ramesh@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={regMobile}
                  onChange={e => setRegMobile(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 sm:py-3 text-base sm:text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="10 digit mobile number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 sm:py-3 text-base sm:text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all pr-10"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Approval Required</span>
                </div>
                <p>
                  After submitting, your request will be reviewed by the admin. Once approved, you can log in to access all premium courses.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-3.5 rounded-xl font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Submit for Admin Approval</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-3">
                <p className="text-xs text-slate-500">Already approved by Admin?</p>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMode('login');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mt-1 cursor-pointer"
                >
                  Log In with Your Credentials
                </button>
              </div>
            </form>
          ) : (
            /* Mode 3: Student Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number / Email / Student ID *
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="Enter Mobile, Email or assigned ID"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <p>
                  <strong>Note:</strong> Only students approved by the Admin can log in. If your request is pending, please wait for admin verification.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Log In to Premium</span>
                  </>
                )}
              </button>

              <div className="text-center pt-3">
                <p className="text-xs text-slate-500">Need a new premium account?</p>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMode('register');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mt-1 cursor-pointer"
                >
                  Register for Premium & Request Approval
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
export default PremiumPortal;
