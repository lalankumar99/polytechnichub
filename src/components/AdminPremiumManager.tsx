import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, CheckCircle, XCircle, Trash2, Edit, Plus, Image as ImageIcon, Book } from 'lucide-react';
import { PremiumCourse } from '../types';

export const AdminPremiumManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users');
  
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<PremiumCourse[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // User Edit State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editId, setEditId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Course Edit State
  const [editingCourse, setEditingCourse] = useState<Partial<PremiumCourse> | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'users') {
        const data = await api.getAdminPremiumUsers();
        setUsers(data || []);
      } else {
        const data = await api.getPremiumCourses();
        setCourses(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // User Methods
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateAdminPremiumUser(editingUser.internalId, { status: editStatus, id: editId });
      setEditingUser(null);
      loadData();
    } catch (err: any) {
      alert('Error updating user: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (internalId: string) => {
    if (!confirm('Are you sure you want to delete this user? They will lose all premium access.')) return;
    try {
      await api.deleteAdminPremiumUser(internalId);
      loadData();
    } catch (err: any) {
      alert('Error deleting user: ' + err.message);
    }
  };

  // Course Methods
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse?.name || !editingCourse?.price) return;
    setIsSavingCourse(true);
    try {
      if (editingCourse.id) {
        await api.updatePremiumCourse(editingCourse.id, editingCourse);
      } else {
        await api.createPremiumCourse(editingCourse as any);
      }
      setEditingCourse(null);
      loadData();
    } catch (err: any) {
      alert('Error saving course: ' + err.message);
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.deletePremiumCourse(id);
      loadData();
    } catch (err: any) {
      alert('Error deleting course: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Premium Ecosystem</h2>
          <p className="text-sm text-slate-500">Manage premium courses and student access.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Student Approvals
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'courses' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Courses
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></div>
      ) : activeTab === 'users' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4">Student</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Assigned ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.internalId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-700">{user.email}</p>
                      <p className="text-xs text-slate-500">{user.mobile}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {user.id || 'Not Assigned'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        user.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {user.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {user.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setEditStatus(user.status);
                          setEditId(user.id || '');
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.internalId)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No premium registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button 
              onClick={() => setEditingCourse({ status: 'published', price: 999 })}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                {course.bannerUrl ? (
                  <div className="h-40 w-full bg-slate-100">
                    <img src={course.bannerUrl} alt={course.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-40 w-full bg-indigo-50 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-indigo-300" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{course.branch}</span>
                    <span className="font-bold text-lg text-emerald-600">₹{course.price}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2">{course.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{course.description}</p>
                  
                  <div className="flex items-center justify-end space-x-2 mt-auto border-t border-slate-100 pt-4">
                     <button
                        onClick={() => setEditingCourse(course)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <Book className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Courses Yet</h3>
                <p className="text-slate-500 mb-4">Create your first premium course to start earning.</p>
                <button 
                  onClick={() => setEditingCourse({ status: 'published', price: 999 })}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-indigo-700"
                >
                  Create Course
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <h3 className="font-bold text-xl">Manage Access</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-4">
                  Student: <span className="font-bold text-slate-900">{editingUser.name}</span>
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                <select 
                  value={editStatus} 
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
                >
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved & Active</option>
                  <option value="rejected">Rejected / Blocked</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assign Login ID</label>
                <input 
                  type="text" 
                  value={editId} 
                  onChange={e => setEditId(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none font-mono" 
                  placeholder="e.g. PH-1001"
                />
                <p className="text-xs text-slate-500 mt-1">Provide this ID to the student. They will use it to log in.</p>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center shadow-md disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Edit Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-8">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <h3 className="font-bold text-xl">{editingCourse.id ? 'Edit Course' : 'Create Course'}</h3>
              <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleSaveCourse} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Course Name *</label>
                  <input 
                    required
                    type="text" 
                    value={editingCourse.name || ''} 
                    onChange={e => setEditingCourse({...editingCourse, name: e.target.value})}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none" 
                    placeholder="e.g. Digital Marketing Mastery"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price (₹) *</label>
                  <input 
                    required
                    type="number" 
                    value={editingCourse.price || 0} 
                    onChange={e => setEditingCourse({...editingCourse, price: parseFloat(e.target.value)})}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none font-mono" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Branch / Category</label>
                  <input 
                    type="text" 
                    value={editingCourse.branch || ''} 
                    onChange={e => setEditingCourse({...editingCourse, branch: e.target.value})}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none" 
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Banner Image Link</label>
                  <input 
                    type="url" 
                    value={editingCourse.bannerUrl || ''} 
                    onChange={e => setEditingCourse({...editingCourse, bannerUrl: e.target.value})}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none" 
                    placeholder="https://example.com/banner.png"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                  <textarea 
                    rows={4}
                    value={editingCourse.description || ''} 
                    onChange={e => setEditingCourse({...editingCourse, description: e.target.value})}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none resize-none" 
                    placeholder="Course details..."
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditingCourse(null)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={isSavingCourse} className="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center shadow-md disabled:opacity-50">
                  {isSavingCourse ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
