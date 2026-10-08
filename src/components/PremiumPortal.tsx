import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  PhoneCall,
  MessageCircle,
  User,
  Clock,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Search,
  Sparkles,
  KeyRound
} from 'lucide-react';

interface PremiumPortalProps {
  onLoginSuccess: (user: any) => void;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const PremiumPortal: React.FC<PremiumPortalProps> = ({ 
  onLoginSuccess, 
  onClose,
  initialMode = 'login' 
}) => {
  // Check if student has previous registration or saved identifier on this device
  const savedIdentifier = (() => {
    try {
      return localStorage.getItem('polytechnic_last_student_identifier') || '';
    } catch {
      return '';
    }
  })();

  const [mode, setMode] = useState<'login' | 'register' | 'success'>(initialMode);
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
  const [loginId, setLoginId] = useState(savedIdentifier);
  const [loginPassword, setLoginPassword] = useState('');

  // Status check state
  const [statusCheckLoading, setStatusCheckLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    checked: boolean;
    user?: any;
    notFound?: boolean;
    message?: string;
  } | null>(null);

  // Auto-fill from localStorage if available
  useEffect(() => {
    if (savedIdentifier && !loginId) {
      setLoginId(savedIdentifier);
    }
  }, [savedIdentifier]);

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
      setError('Please fill in all required fields (Name, Email, Mobile, Password)');
      setLoading(false);
      return;
    }

    try {
      const registeredUser = await api.registerPremiumUser({
        name: regName.trim(),
        email: regEmail.trim(),
        mobile: regMobile.trim(),
        password: regPassword,
        photoUrl: regPhoto || ''
      });
      // Save contact so student can easily log in once approved
      try {
        localStorage.setItem('polytechnic_last_student_identifier', regMobile.trim());
      } catch (e) {
        // storage ignored
      }
      setLoginId(regMobile.trim());
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
    setStatusResult(null);

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
      try {
        localStorage.setItem('polytechnic_premium_user', JSON.stringify(user));
        localStorage.setItem('polytechnic_last_student_identifier', user.mobile || user.id || loginId.trim());
      } catch (e) {
        // storage ignored
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials or verify admin approval.');
    } finally {
      setLoading(false);
    }
  };

  // Check approval status directly with Mobile or Email
  const handleCheckStatus = async () => {
    const query = (loginId || regMobile).trim();
    if (!query) {
      setError('Please enter your Mobile number or Email first to check status');
      return;
    }
    setError('');
    setStatusCheckLoading(true);
    setStatusResult(null);

    try {
      const res = await api.checkPremiumUserStatus(query);
      if (res.success && res.user) {
        setStatusResult({
          checked: true,
          user: res.user,
          notFound: false
        });
        if (res.user.status === 'approved') {
          setMode('login');
        }
      } else if (res.notFound) {
        setStatusResult({
          checked: true,
          notFound: true,
          message: res.message || 'No registered student found with this Mobile number.'
        });
      } else {
        setStatusResult({
          checked: true,
          notFound: false,
          message: res.message || 'Unable to fetch status.'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Could not verify status');
    } finally {
      setStatusCheckLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative my-auto sm:my-8 border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 p-4 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-3 mb-1.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black">Polytechnic Premium</h2>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 tracking-wider uppercase">
                Official Student Portal
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-indigo-100 opacity-90">
            {mode === 'login'
              ? 'Log in to unlock all assigned lectures, theory notes and PYQs'
              : mode === 'register'
              ? 'Register with student details & photo for Admin Approval'
              : 'Application Submitted for Admin Approval'}
          </p>
        </div>

        {/* ALWAYS VISIBLE TOP TAB SELECTOR (Mobile Optimized & Pinned) */}
        {mode !== 'success' && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 gap-1.5 sticky top-0 z-20">
            <button
              type="button"
              onClick={() => {
                setError('');
                setStatusResult(null);
                setMode('login');
              }}
              className={`py-2.5 px-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <KeyRound className={`w-4 h-4 ${mode === 'login' ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>Already Approved? Log In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setError('');
                setStatusResult(null);
                setMode('register');
              }}
              className={`py-2.5 px-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <User className={`w-4 h-4 ${mode === 'register' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>New Registration</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 text-rose-700 rounded-2xl flex items-start space-x-2.5 text-xs sm:text-sm font-semibold border border-rose-200 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Mode 1: Success State after Registration */}
          {mode === 'success' ? (
            <div className="text-center py-2 space-y-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Registration Sent to Admin!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Your student application has been securely recorded.
                  <strong> Once the administrator approves your request</strong>, you can immediately log in with your mobile number and password.
                </p>
              </div>

              {/* Student Summary Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left flex items-center space-x-3.5 max-w-sm mx-auto">
                {regPhoto ? (
                  <img
                    src={regPhoto}
                    alt={regName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                    {regName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{regName}</h4>
                  <p className="text-xs text-slate-500 truncate">{regMobile} • {regEmail}</p>
                  <div className="inline-flex items-center space-x-1 mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Status: Pending Admin Approval</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 max-w-sm mx-auto pt-1">
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMode('login');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-1 cursor-pointer"
                >
                  Already Approved? Go to Log In &rarr;
                </button>
              </div>
            </div>
          ) : mode === 'register' ? (
            /* Mode 2: Student Registration Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              
              {/* TOP BANNER FOR MOBILE: ALREADY APPROVED BY ADMIN? */}
              <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-blue-500/15 border-2 border-amber-300 rounded-2xl p-3 flex items-center justify-between gap-2.5 shadow-xs">
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5 font-black text-xs text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Already approved by Admin?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-tight mt-0.5">
                    अगर एडमिन ने अप्रूव कर दिया है तो सीधे लॉगिन करें
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMode('login');
                  }}
                  className="shrink-0 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <span>Log In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Profile Photo Uploader */}
              <div className="flex flex-col items-center justify-center py-1">
                <div className="relative group cursor-pointer">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 border-indigo-200 shadow-sm bg-slate-100 flex items-center justify-center">
                    {regPhoto ? (
                      <img
                        src={regPhoto}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  
                  <label
                    htmlFor="student-photo-upload"
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110 cursor-pointer border-2 border-white"
                    title="Upload original profile photo"
                  >
                    <span className="text-[10px] font-bold">+</span>
                  </label>
                  
                  <input
                    id="student-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1">
                  Student Photo (Optional)
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
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="e.g. Rahul Kumar"
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
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
                  placeholder="e.g. student@gmail.com"
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
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
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
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all pr-10"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Permanent Account Safeguard</span>
                </div>
                <p>
                  After submitting, the admin will approve your request. Student accounts are permanently saved and never deleted automatically without admin.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-3 rounded-xl font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
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

              {/* BOTTOM FOOTER LINK FOR ALREADY APPROVED */}
              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">Already approved by Admin?</p>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setMode('login');
                  }}
                  className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors mt-0.5 cursor-pointer underline"
                >
                  Log In with Your Mobile Number &rarr;
                </button>
              </div>
            </form>
          ) : (
            /* Mode 3: Student Login Form */
            <form onSubmit={handleLogin} className="space-y-4">

              {/* STATUS CHECK DISPLAY CARD IF CHECKED */}
              {statusResult && (
                <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-medium ${
                  statusResult.user?.status === 'approved'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : statusResult.user?.status === 'pending'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : statusResult.notFound
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {statusResult.user?.status === 'approved' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-1.5 font-black text-emerald-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Account APPROVED by Admin! (सफलतापूर्वक स्वीकृत)</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-tight">
                        <strong>Student:</strong> {statusResult.user.name} &bull; <strong>ID:</strong> {statusResult.user.id || 'Active'}
                      </p>
                      <p className="text-[11px] text-emerald-800 font-bold">
                        &rarr; Enter your password below to log in directly!
                      </p>
                    </div>
                  )}

                  {statusResult.user?.status === 'pending' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-1.5 font-black text-amber-800">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Status: Pending Admin Approval</span>
                      </div>
                      <p className="text-xs text-slate-700">
                        Hi {statusResult.user.name}, your request has reached the Admin and is waiting for approval.
                      </p>
                      <div className="pt-1 flex items-center space-x-2">
                        <a
                          href={`https://wa.me/919296783086?text=Hello%20Admin,%20Please%20approve%20my%20Polytechnic%20Hub%20account.%20Name:%20${encodeURIComponent(statusResult.user.name)},%20Mobile:%20${encodeURIComponent(statusResult.user.mobile)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-[#25D366] text-white font-bold rounded-lg text-[11px] inline-flex items-center space-x-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp Admin</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {statusResult.notFound && (
                    <div className="space-y-1 text-center py-1">
                      <p className="font-bold text-slate-800">No student record found with this number.</p>
                      <p className="text-[11px] text-slate-500">
                        Please check the mobile number or register as a new student.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setStatusResult(null);
                          setMode('register');
                        }}
                        className="mt-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                      >
                        Register New Student &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number / Email / Student ID *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all pr-24"
                    placeholder="e.g. 7545822680 or ID"
                  />
                  <button
                    type="button"
                    onClick={handleCheckStatus}
                    disabled={statusCheckLoading}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200 transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                    title="Check if Admin has approved your mobile number"
                  >
                    {statusCheckLoading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border border-indigo-600 border-t-transparent" />
                    ) : (
                      <>
                        <Search className="w-3 h-3 text-indigo-600" />
                        <span>Check Status</span>
                      </>
                    )}
                  </button>
                </div>
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
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-base sm:text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-900 flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-tight">
                  <strong>Already approved students:</strong> Log in with your 10-digit mobile number and registered password. All student data is permanently safe and never deleted without admin.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
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

              <div className="text-center pt-2 border-t border-slate-100 space-y-1.5">
                <p className="text-xs text-slate-500">Need a new premium student account?</p>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setStatusResult(null);
                    setMode('register');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Register New Student for Admin Approval &rarr;
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
