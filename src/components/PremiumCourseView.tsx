import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PremiumCourse, PremiumItem, PremiumAccessRequest } from '../types';
import { Shield, Lock, CreditCard, ChevronLeft, CheckCircle, Clock, AlertCircle, FileText, Folder, Youtube, Link2, Code } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { MessageCircle, PhoneCall } from 'lucide-react';

interface PremiumCourseViewProps {
  course: PremiumCourse;
  onBack: () => void;
  user: any;
  onOpenFile: (file: any) => void;
}

export const PremiumCourseView: React.FC<PremiumCourseViewProps> = ({ course, onBack, user, onOpenFile }) => {
  const [accessStatus, setAccessStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [items, setItems] = useState<PremiumItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAccessAndData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const requests = await api.getUserPremiumRequests(user.uid);
      const request = requests.find((r: any) => r.courseId === course.id);
      
      if (request) {
        setAccessStatus(request.status);
        if (request.status === 'approved') {
          const courseItems = await api.getPremiumItems(course.id);
          setItems(courseItems.filter((i: any) => i.status === 'published'));
        }
      } else {
        setAccessStatus('none');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccessAndData();
  }, [user, course.id]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  
  const [formData, setFormData] = useState({ name: user?.displayName || '', mobile: '', email: user?.email || '', password: '', confirmPassword: '' });
  const [formError, setFormError] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    
    try {
      let currentUser = user;
      
      // If user is not logged in, create account
      if (!currentUser) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        currentUser = userCredential.user;
        await updateProfile(currentUser, { displayName: formData.name });
      }
      
      // Submit access request
      await api.createPremiumRequest({
        userId: currentUser.uid,
        userEmail: currentUser.email || formData.email,
        userName: currentUser.displayName || formData.name,
        courseId: course.id,
        mobile: formData.mobile,
        status: 'pending'
      });
      
      setApplicationSuccess(true);
      await loadAccessAndData(); // refresh status in background
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await api.createPremiumRequest({
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        courseId: course.id,
        status: 'pending'
      });
      await loadAccessAndData();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const currentItems = items.filter(i => i.parentId === currentFolder);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Banner */}
      <div className="relative h-64 md:h-80 bg-slate-900 overflow-hidden">
        {course.bannerUrl ? (
          <img src={course.bannerUrl} alt={course.name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 flex flex-col justify-end pb-8">
          <button 
            onClick={onBack}
            className="absolute top-6 left-4 md:left-8 bg-slate-900/50 hover:bg-slate-800 p-2 rounded-full text-white backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-block bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                {course.branch}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white">{course.name}</h1>
            </div>
            <div className="text-right">
              <span className="text-3xl md:text-5xl font-black text-amber-400">₹{course.price}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : accessStatus === 'approved' ? (
          /* Premium Content Viewer */
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-sm text-slate-500 mb-4">
              <button onClick={() => setCurrentFolder(null)} className="hover:text-amber-600">Root</button>
              {currentFolder && (
                <>
                  <span>/</span>
                  <span className="text-slate-800 font-medium">Folder</span>
                </>
              )}
            </div>

            {currentItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <Folder className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Empty Folder</h3>
                <p className="text-slate-500">No content available here yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => item.type === 'folder' ? setCurrentFolder(item.id) : onOpenFile(item)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg cursor-pointer transition-all flex items-center space-x-4"
                  >
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                      {item.type === 'folder' && <Folder className="w-6 h-6" />}
                      {item.type === 'pdf' && <FileText className="w-6 h-6" />}
                      {item.type === 'youtube' && <Youtube className="w-6 h-6" />}
                      {item.type === 'link' && <Link2 className="w-6 h-6" />}
                      {item.type === 'html' && <Code className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{item.name}</h3>
                      <p className="text-xs text-slate-500 capitalize">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          
          /* Access Gate & Form */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            {applicationSuccess || accessStatus === 'pending' ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
                  Your Application is successfully.
                </h2>
                <p className="text-lg text-slate-600 mb-8 font-medium">
                  Connect Admin and pay ₹{course.price || 19} Only.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                  {course.paymentLink && (
                    <a 
                      href={course.paymentLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <CreditCard className="w-6 h-6" />
                      Pay Now
                    </a>
                  )}
                  <a 
                    href={`https://wa.me/919296783086?text=Hi%20Admin,%20I%20have%20applied%20for%20the%20Premium%20Course:%20${encodeURIComponent(course.name)}.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#20bd5a] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Connect WhatsApp
                  </a>
                  <a 
                    href="tel:+919296783086"
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <PhoneCall className="w-6 h-6" />
                    Call Admin
                  </a>
                </div>
                <p className="text-sm text-slate-500 mt-8">
                  After payment, the admin will confirm your access and you can view the premium course.
                </p>
              </div>
            ) : accessStatus === 'rejected' ? (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Access Rejected</h3>
                <p className="text-slate-600 mb-6">Your previous application was rejected by the admin.</p>
                <button 
                  onClick={() => setApplicationSuccess(false)} // allow them to see form again or handle request
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Contact Admin
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-8">
                  <span className="inline-block bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide mb-3">Premium Access</span>
                  <h2 className="text-2xl font-bold text-slate-900">Apply for Course Access</h2>
                  <p className="text-slate-500 mt-2">Fill out the details to get access to this premium material.</p>
                </div>
                
                <form onSubmit={handleApplicationSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.mobile}
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                      placeholder="Enter your WhatsApp number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      disabled={!!user} // disabled if already logged in
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  {!user && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Create Password</label>
                        <input 
                          type="password" 
                          required 
                          minLength={6}
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="Minimum 6 characters"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                        <input 
                          type="password" 
                          required 
                          minLength={6}
                          value={formData.confirmPassword}
                          onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                          placeholder="Confirm your password"
                        />
                      </div>
                    </>
                  )}

                  {formError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                      {formError}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 hover:shadow-lg transition-all duration-300 disabled:opacity-70 flex justify-center items-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
