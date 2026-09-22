import React, { useState } from 'react';
import { api } from '../services/api';
import { Shield, CheckCircle, AlertCircle, PhoneCall, MessageCircle } from 'lucide-react';

interface PremiumPortalProps {
  onLoginSuccess: (user: any) => void;
  onClose: () => void;
}

export const PremiumPortal: React.FC<PremiumPortalProps> = ({ onLoginSuccess, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'success'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Login state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.registerPremiumUser({
        name: regName,
        email: regEmail,
        mobile: regMobile,
        password: regPassword
      });
      setMode('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await api.loginPremiumUser({ identifier: loginId, password: loginPassword });
      localStorage.setItem('polytechnic_premium_user', JSON.stringify(user));
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative my-8">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-indigo-200 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-amber-400" />
            <h2 className="text-2xl font-black">Premium Access</h2>
          </div>
          <p className="text-indigo-100 opacity-90">
            {mode === 'login' ? 'Login with your Admin-provided ID' : 
             mode === 'register' ? 'Register for premium course access' : 
             'Registration Successful'}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl flex items-start space-x-3 text-sm font-medium border border-rose-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'success' ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Registration Received!</h3>
              <p className="text-slate-600 mb-6">
                Your application for Premium Access has been sent to the admin. 
                Please contact the admin via WhatsApp or Call to complete payment and get your Login ID.
              </p>
              
              <div className="flex flex-col space-y-3 mb-8">
                <a 
                  href={`https://wa.me/919296783086?text=Hi%20Admin,%20I%20have%20registered%20for%20Premium.%20My%20name%20is%20${encodeURIComponent(regName)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#20bd5a] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Message on WhatsApp</span>
                </a>
                <a 
                  href="tel:+919296783086"
                  className="w-full flex items-center justify-center space-x-2 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  <PhoneCall className="w-5 h-5" />
                  <span>Call Admin</span>
                </a>
              </div>

              <button 
                onClick={() => setMode('login')}
                className="text-indigo-600 font-bold hover:text-indigo-700"
              >
                I already have my Login ID
              </button>
            </div>
          ) : mode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
                <input 
                  type="text" required value={regName} onChange={e => setRegName(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors" 
                  placeholder="e.g. Rahul Kumar"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address *</label>
                <input 
                  type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors" 
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Number *</label>
                <input 
                  type="tel" required value={regMobile} onChange={e => setRegMobile(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors" 
                  placeholder="10 digit number"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Create Password *</label>
                <input 
                  type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors" 
                  placeholder="Minimum 6 characters" minLength={6}
                />
              </div>
              
              <button 
                type="submit" disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mt-4 disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Register & Apply'}
              </button>
              
              <div className="text-center mt-6">
                <p className="text-sm text-slate-600 mb-2">Already have an ID from Admin?</p>
                <button 
                  type="button" onClick={() => setMode('login')}
                  className="text-indigo-600 font-bold hover:text-indigo-700"
                >
                  Login to Premium
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Login ID / Mobile / Email</label>
                <input 
                  type="text" required value={loginId} onChange={e => setLoginId(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors" 
                  placeholder="Enter ID given by Admin"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                <input 
                  type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors" 
                  placeholder="Password set during registration"
                />
              </div>
              
              <button 
                type="submit" disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg mt-4 disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Login securely'}
              </button>
              
              <div className="text-center mt-6">
                <p className="text-sm text-slate-600 mb-2">Don't have an account yet?</p>
                <button 
                  type="button" onClick={() => setMode('register')}
                  className="text-indigo-600 font-bold hover:text-indigo-700"
                >
                  Register for Premium
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
