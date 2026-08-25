const fs = require('fs');
let content = fs.readFileSync('src/components/PremiumCourseView.tsx', 'utf-8');

const importsToAdd = `import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';\nimport { MessageCircle, PhoneCall, CheckCircle } from 'lucide-react';`;

if (!content.includes('createUserWithEmailAndPassword')) {
  content = content.replace("import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';", "import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';\nimport { MessageCircle, PhoneCall, CheckCircle } from 'lucide-react';");
}

const formStateCode = `
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
`;

// Insert the form state before `const handleRequestAccess = async () => {`
content = content.replace("const handleRequestAccess = async () => {", formStateCode + "\n  const handleRequestAccess = async () => {");

const accessGateReplacement = `
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
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href={\`https://wa.me/919296783086?text=Hi%20Admin,%20I%20have%20applied%20for%20the%20Premium%20Course:%20\${encodeURIComponent(course.name)}.\`}
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
`;

// Now replace from "/* Access Gate */" to the end of that block.
// Let's use a regex that matches from /* Access Gate */ up to the closing `</div>\n        )}`
content = content.replace(/\/\*\s*Access Gate\s*\*\/[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*\);\s*};)/, accessGateReplacement);

fs.writeFileSync('src/components/PremiumCourseView.tsx', content);
