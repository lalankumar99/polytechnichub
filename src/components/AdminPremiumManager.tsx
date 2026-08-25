import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PremiumCourse, PremiumAccessRequest, PremiumItem } from '../types';
import { Plus, Check, X, Shield, Folder, FileText, Lock, PlusCircle, CreditCard, Save } from 'lucide-react';

export const AdminPremiumManager: React.FC = () => {
  const [courses, setCourses] = useState<PremiumCourse[]>([]);
  const [requests, setRequests] = useState<PremiumAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'courses' | 'requests'>('courses');

  // Course Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<PremiumCourse | null>(null);
  
  // File Modal
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedCourseForFile, setSelectedCourseForFile] = useState<string | null>(null);

  // File Form
  const [fileType, setFileType] = useState<'folder' | 'pdf' | 'youtube' | 'link' | 'html'>('folder');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 29,
    branch: '',
    bannerUrl: '',
    paymentLink: 'upi://pay?pa=9973532153@ibl&pn=User&am=19&cu=INR'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedCourses, fetchedRequests] = await Promise.all([
        api.getPremiumCourses(),
        api.getPremiumRequests()
      ]);
      setCourses(fetchedCourses);
      setRequests(fetchedRequests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.updatePremiumCourse(editingCourse.id, formData);
      } else {
        await api.createPremiumCourse(formData as Omit<PremiumCourse, 'id' | 'createdAt' | 'updatedAt'>);
      }
      setShowCourseModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForFile) return;
    try {
      await api.createPremiumItem({
        courseId: selectedCourseForFile,
        name: fileName,
        type: fileType,
        url: fileUrl,
        status: 'published',
        parentId: null
      });
      setShowFileModal(false);
      setFileName('');
      setFileUrl('');
      // Ideally update the local state for files, but we don't display them heavily here yet.
      alert('Content added to premium course');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await api.updatePremiumRequest(requestId, status);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-b-2 border-amber-500 rounded-full mx-auto"></div></div>;
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Sub Tabs */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveSubTab('courses')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeSubTab === 'courses' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Courses Manager
        </button>
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeSubTab === 'requests' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Access Requests
          {requests.filter(r => r.status === 'pending').length > 0 && (
            <span className="ml-2 bg-rose-500 text-white px-2 py-0.5 rounded-full text-xs">
              {requests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'courses' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Premium Courses</h2>
            <button
              onClick={() => {
                setEditingCourse(null);
                setFormData({ name: '', description: '', price: 29, branch: 'Computer Science', bannerUrl: '', paymentLink: 'upi://pay?pa=9973532153@ibl&pn=User&am=19&cu=INR' });
                setShowCourseModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-xl font-bold text-sm flex items-center shadow-md transition-all"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div key={course.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="h-32 bg-slate-900 relative">
                  {course.bannerUrl && <img src={course.bannerUrl} alt={course.name} className="w-full h-full object-cover opacity-70" />}
                  <div className="absolute top-2 right-2 bg-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-md">
                    ₹{course.price}
                  </div>
                  <div className="absolute bottom-2 left-3">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                      {course.branch}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-white space-y-4">
                  <h3 className="font-bold text-slate-900 line-clamp-1">{course.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingCourse(course);
                        setFormData({
                          name: course.name,
                          description: course.description,
                          price: course.price,
                          branch: course.branch,
                          bannerUrl: course.bannerUrl || '',
                          paymentLink: course.paymentLink || ''
                        });
                        setShowCourseModal(true);
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors text-center"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourseForFile(course.id);
                        setShowFileModal(true);
                      }}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-xl text-xs font-bold transition-colors text-center flex items-center justify-center"
                    >
                      <PlusCircle className="w-3 h-3 mr-1" />
                      Add Content
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No premium courses created yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'requests' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map(req => {
                const course = courses.find(c => c.id === req.courseId);
                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-sm">{req.userName}</p>
                      <p className="text-xs text-slate-500">{req.userEmail}</p>
                      {req.mobile && <p className="text-xs font-medium text-amber-600 mt-1">📞 {req.mobile}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded-lg">
                        {course ? course.name : 'Unknown Course'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {req.status === 'pending' && <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded-md">Pending</span>}
                      {req.status === 'approved' && <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-md">Approved</span>}
                      {req.status === 'rejected' && <span className="text-rose-600 font-bold text-xs bg-rose-50 px-2 py-1 rounded-md">Rejected</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleRequestStatus(req.id, 'approved')}
                            className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRequestStatus(req.id, 'rejected')}
                            className="p-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No access requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <h3 className="font-bold text-xl">{editingCourse ? 'Edit Course' : 'Create Premium Course'}</h3>
              <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Course Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input type="number" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Branch/Category</label>
                  <input type="text" required value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Link (Optional)</label>
                <input type="text" value={formData.paymentLink} onChange={e => setFormData({...formData, paymentLink: e.target.value})} placeholder="e.g. UPI, Razorpay link" className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Banner Image URL</label>
                <input type="text" value={formData.bannerUrl} onChange={e => setFormData({...formData, bannerUrl: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-amber-500 outline-none" />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowCourseModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition-colors flex items-center shadow-md">
                  <Save className="w-4 h-4 mr-2" />
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Modal */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
              <h3 className="font-bold text-xl">Add Premium Content</h3>
              <button onClick={() => setShowFileModal(false)} className="text-white/70 hover:text-white"><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleCreateFileSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Content Type</label>
                <select value={fileType} onChange={e => setFileType(e.target.value as any)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none bg-white">
                  <option value="folder">Folder</option>
                  <option value="pdf">PDF File</option>
                  <option value="youtube">YouTube Video</option>
                  <option value="link">External Link</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Name / Title</label>
                <input type="text" required value={fileName} onChange={e => setFileName(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none" />
              </div>
              {fileType !== 'folder' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">URL (Drive link, YouTube link, etc)</label>
                  <input type="url" required value={fileUrl} onChange={e => setFileUrl(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none" />
                </div>
              )}
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowFileModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
