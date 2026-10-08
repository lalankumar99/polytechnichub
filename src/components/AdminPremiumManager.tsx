import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit, 
  Plus, 
  Image as ImageIcon, 
  Book,
  FileText,
  Youtube,
  Link2,
  Folder,
  ChevronLeft,
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  ExternalLink,
  BookOpen,
  Code,
  Upload,
  FileCode,
  Radio,
  Tv,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Play,
  AlertCircle
} from 'lucide-react';
import { PremiumCourse, PremiumItem } from '../types';
import { extractYoutubeId } from '../utils/formatters';

export const AdminPremiumManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users');
  
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<PremiumCourse[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // User Edit & Course Assignment State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [editId, setEditId] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Course Edit State
  const [editingCourse, setEditingCourse] = useState<Partial<PremiumCourse> | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [showLiveGuide, setShowLiveGuide] = useState(false);
  const [previewEmbedId, setPreviewEmbedId] = useState<string | null>(null);

  // Course Content Management State
  const [managingCourse, setManagingCourse] = useState<PremiumCourse | null>(null);
  const [courseItems, setCourseItems] = useState<PremiumItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [loadingItems, setLoadingItems] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<PremiumItem> | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, coursesData] = await Promise.all([
        api.getAdminPremiumUsers().catch(() => []),
        api.getPremiumCourses().catch(() => [])
      ]);
      setUsers(usersData || []);
      setCourses(coursesData || []);
    } catch (err) {
      console.error('Error loading premium ecosystem data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Load items when managing a course
  const loadCourseItems = async (courseId: string) => {
    try {
      setLoadingItems(true);
      const items = await api.getPremiumItems(courseId);
      setCourseItems(items || []);
    } catch (err) {
      console.error('Failed to load course items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleOpenCourseContent = (course: PremiumCourse) => {
    setManagingCourse(course);
    setCurrentFolderId(null);
    loadCourseItems(course.id);
  };

  const handleBackToCourses = () => {
    setManagingCourse(null);
    setCurrentFolderId(null);
    setCourseItems([]);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingCourse || !newFolderName.trim()) return;
    try {
      await api.createPremiumItem({
        courseId: managingCourse.id,
        name: newFolderName.trim(),
        type: 'folder',
        parentId: currentFolderId,
        status: 'published',
        size: 0,
        fileUrl: '',
        content: ''
      });
      setNewFolderName('');
      setIsCreatingFolder(false);
      loadCourseItems(managingCourse.id);
    } catch (err: any) {
      alert('Error creating folder: ' + err.message);
    }
  };

  // User Actions
  const handleQuickApprove = async (user: any) => {
    try {
      const assignedId = user.id || `PH-${Math.floor(100 + Math.random() * 900)}`;
      // If user had no courses, we can open assignment modal or default to existing
      await api.updateAdminPremiumUser(user.internalId, {
        status: 'approved',
        id: assignedId,
        assignedCourseIds: user.assignedCourseIds || []
      });
      loadData();
    } catch (err: any) {
      alert('Error approving user: ' + err.message);
    }
  };

  const handleQuickReject = async (user: any) => {
    try {
      await api.updateAdminPremiumUser(user.internalId, {
        status: 'rejected'
      });
      loadData();
    } catch (err: any) {
      alert('Error rejecting user: ' + err.message);
    }
  };

  const handleOpenEditUser = (user: any) => {
    setEditingUser(user);
    setEditStatus(user.status || 'pending');
    setEditId(user.id || '');
    setSelectedCourseIds(Array.isArray(user.assignedCourseIds) ? user.assignedCourseIds : []);
  };

  const handleToggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAllCourses = () => {
    setSelectedCourseIds(courses.map(c => c.id));
  };

  const handleClearAllCourses = () => {
    setSelectedCourseIds([]);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await api.updateAdminPremiumUser(editingUser.internalId, { 
        status: editStatus, 
        id: editId.trim() || editingUser.id || `PH-${Math.floor(100 + Math.random() * 900)}`,
        assignedCourseIds: selectedCourseIds
      });
      setEditingUser(null);
      loadData();
    } catch (err: any) {
      alert('Error updating user: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (internalId: string) => {
    const user = users.find(u => u.internalId === internalId);
    const identifier = user ? `${user.name} (${user.mobile || user.id})` : internalId;
    if (!confirm(`ADMIN CONFIRMATION:\n\nAre you sure you want to delete student "${identifier}"?\n\nStudents are NEVER automatically deleted by the system. Only proceed if you explicitly wish to remove this student.`)) return;
    try {
      await api.deleteAdminPremiumUser(internalId);
      loadData();
    } catch (err: any) {
      alert('Error deleting user: ' + err.message);
    }
  };

  // Course Actions
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
    if (!confirm('Are you sure you want to delete this course? Students assigned to this course will no longer see it.')) return;
    try {
      await api.deletePremiumCourse(id);
      loadData();
    } catch (err: any) {
      alert('Error deleting course: ' + err.message);
    }
  };

  const handleToggleCourseLive = async (course: PremiumCourse) => {
    const nextStatus = !course.isLive;
    if (nextStatus && !course.liveYoutubeUrl) {
      alert('Please add a YouTube Live Stream URL or Video ID to this course first (click Edit).');
      return;
    }
    try {
      await api.toggleCourseLive(course.id, nextStatus);
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isLive: nextStatus } : c));
    } catch (err: any) {
      alert('Error updating live status: ' + err.message);
    }
  };

  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setEditingItem(prev => ({
        ...prev,
        content,
        fileUrl: prev?.fileUrl || 'html-content',
        name: prev?.name || file.name.replace(/\.(html|htm)$/i, '')
      }));
    };
    reader.readAsText(file);
  };

  // Course Item Actions
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingCourse || !editingItem?.name) return;

    if (editingItem.type === 'html' && !editingItem.content && !editingItem.fileUrl) {
      alert('Please paste HTML code or upload an HTML file.');
      return;
    }

    if (editingItem.type !== 'html' && !editingItem.fileUrl) {
      alert('Please enter a valid link or embed code.');
      return;
    }

    setIsSavingItem(true);
    try {
      const itemData = {
        ...editingItem,
        courseId: managingCourse.id,
        parentId: editingItem.parentId !== undefined ? editingItem.parentId : (currentFolderId || null),
        fileUrl: editingItem.fileUrl || (editingItem.type === 'html' ? 'html-content' : ''),
        content: editingItem.content || '',
        status: editingItem.status || 'published',
        type: editingItem.type || 'pdf',
        size: editingItem.content ? editingItem.content.length : (editingItem.size || 0)
      };

      if (editingItem.id) {
        await api.updatePremiumItem(editingItem.id, itemData);
      } else {
        await api.createPremiumItem(itemData);
      }
      setEditingItem(null);
      loadCourseItems(managingCourse.id);
    } catch (err: any) {
      alert('Error saving course item: ' + err.message);
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item from the course?')) return;
    try {
      await api.deletePremiumItem(itemId);
      if (managingCourse) {
        loadCourseItems(managingCourse.id);
      }
    } catch (err: any) {
      alert('Error deleting item: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Premium Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Admin controls: Assign specific courses to students, create courses, and add content.
          </p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={() => {
              setActiveTab('users');
              setManagingCourse(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'users' && !managingCourse ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Student Approvals & Courses</span>
            {users.filter(u => u.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white animate-pulse">
                {users.filter(u => u.status === 'pending').length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('courses');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'courses' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Book className="w-4 h-4" />
            <span>Courses & Content ({courses.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-xs text-slate-400 mt-3 font-medium">Loading premium ecosystem data...</p>
        </div>
      ) : activeTab === 'users' ? (
        
        /* ---------------- STUDENT APPROVALS & COURSE ALLOCATION ---------------- */
        <div className="space-y-4">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                {users.length}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Total Registered</p>
                <p className="text-sm font-extrabold text-slate-900">{users.length} Students</p>
              </div>
            </div>

            <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 shadow-xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                {users.filter(u => u.status === 'approved').length}
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-600 uppercase">Approved Students</p>
                <p className="text-sm font-extrabold text-emerald-950">{users.filter(u => u.status === 'approved').length} Active Access</p>
              </div>
            </div>

            <div className="bg-white border border-amber-200 rounded-2xl p-3.5 shadow-xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                {users.filter(u => u.status === 'pending').length}
              </div>
              <div>
                <p className="text-[11px] font-bold text-amber-600 uppercase">Pending Review</p>
                <p className="text-sm font-extrabold text-amber-950">{users.filter(u => u.status === 'pending').length} Requests</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-extrabold text-emerald-950">Permanent Student Data Protection</p>
                <p className="text-emerald-800 mt-0.5">
                  Student accounts and approvals are permanently saved. Students are <strong>NEVER automatically deleted without Admin</strong> action.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="p-4">Student Profile</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Student ID</th>
                    <th className="p-4">Assigned Courses</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(user => {
                    const assignedIds: string[] = Array.isArray(user.assignedCourseIds) ? user.assignedCourseIds : [];
                    const assignedCourses = courses.filter(c => assignedIds.includes(c.id));

                    return (
                      <tr key={user.internalId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            {user.photoUrl ? (
                              <img
                                src={user.photoUrl}
                                alt={user.name}
                                className="w-11 h-11 rounded-full object-cover border-2 border-indigo-400 shadow-sm shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">{user.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Reg: {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <p className="text-xs font-semibold text-slate-800">{user.email}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{user.mobile}</p>
                        </td>

                        <td className="p-4">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-lg inline-block">
                            {user.id || 'Not Assigned'}
                          </span>
                        </td>

                        {/* Assigned Courses Column */}
                        <td className="p-4">
                          <div className="space-y-1.5 max-w-xs">
                            {assignedCourses.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {assignedCourses.map(c => (
                                  <span 
                                    key={c.id} 
                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 truncate max-w-[140px]"
                                    title={c.name}
                                  >
                                    ⚡ {c.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] font-semibold text-slate-400 italic">
                                0 Courses Assigned
                              </span>
                            )}
                            
                            <button
                              onClick={() => handleOpenEditUser(user)}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                            >
                              <Layers className="w-3 h-3" />
                              <span>{assignedCourses.length > 0 ? 'Change Courses' : '+ Select Courses'}</span>
                            </button>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            user.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            user.status === 'rejected' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {user.status === 'approved' && <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />}
                            {user.status === 'rejected' && <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />}
                            {user.status.toUpperCase()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {user.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleQuickApprove(user)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                                  title="Approve Student Account"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleQuickReject(user)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs transition-all cursor-pointer"
                                  title="Reject Registration"
                                >
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {user.status === 'approved' && (
                              <button
                                onClick={() => handleQuickReject(user)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                                title="Revoke / Suspend Access"
                              >
                                Revoke
                              </button>
                            )}

                            {user.status === 'rejected' && (
                              <button
                                onClick={() => handleQuickApprove(user)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer"
                                title="Re-approve"
                              >
                                Re-Approve
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditUser(user)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                              title="Edit Details & Assign Specific Courses"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.internalId)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Delete User Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500">
                        No student registrations found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      ) : managingCourse ? (

        /* ---------------- COURSE CONTENT & MODULES MANAGER ---------------- */
        <div className="space-y-5">
          {/* Header for Managed Course */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToCourses}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Back to All Courses"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-indigo-100 text-indigo-800">
                    {managingCourse.branch || 'Course'}
                  </span>
                  <h3 className="font-extrabold text-lg text-slate-900">{managingCourse.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage the notes, PDFs, drive links, and videos inside this premium course.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setNewFolderName('');
                  setIsCreatingFolder(true);
                }}
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                title="Create a folder inside this course or current folder"
              >
                <Folder className="w-4 h-4" />
                <span>+ New Folder</span>
              </button>

              <button
                onClick={() => setEditingItem({ status: 'published', type: 'pdf', parentId: currentFolderId })}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Content</span>
              </button>
            </div>
          </div>

          {/* Breadcrumb Navigation inside folders */}
          <div className="flex items-center justify-between text-xs bg-slate-100 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-2 flex-wrap">
              <button
                onClick={() => setCurrentFolderId(null)}
                className={`font-bold hover:text-indigo-600 transition-colors cursor-pointer flex items-center space-x-1 ${
                  currentFolderId === null ? 'text-indigo-700 font-extrabold' : 'text-slate-600'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Course Root ({managingCourse.name})</span>
              </button>

              {currentFolderId && (() => {
                const currentFolder = courseItems.find(i => i.id === currentFolderId);
                return (
                  <>
                    <span className="text-slate-400 font-bold">/</span>
                    <span className="font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg flex items-center space-x-1 border border-amber-200">
                      <Folder className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span>{currentFolder?.name || 'Folder'}</span>
                    </span>
                  </>
                );
              })()}
            </div>

            {currentFolderId && (
              <button
                onClick={() => {
                  const curr = courseItems.find(i => i.id === currentFolderId);
                  setCurrentFolderId(curr?.parentId || null);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1 px-2.5 py-1 bg-white rounded-lg border border-slate-200 shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Up / Back</span>
              </button>
            )}
          </div>

          {/* List of items in this course */}
          {loadingItems ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-xs text-slate-400 mt-2 font-medium">Loading course modules...</p>
            </div>
          ) : (() => {
            const displayedItems = courseItems.filter(item => {
              if (currentFolderId === null) {
                return !item.parentId || item.parentId === null;
              }
              return item.parentId === currentFolderId;
            });

            if (displayedItems.length === 0) {
              return (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    {currentFolderId ? <Folder className="w-6 h-6 text-amber-500" /> : <BookOpen className="w-6 h-6" />}
                  </div>
                  <h4 className="font-bold text-base text-slate-900">
                    {currentFolderId ? 'Folder is Empty' : 'No Content in this Course Yet'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {currentFolderId 
                      ? 'Click "+ Add Content" above to add videos, PDFs, or notes into this folder, or "+ New Folder" to create a sub-folder.'
                      : 'Add lecture notes, Google Drive PDFs, folders, or YouTube videos for students enrolled in this course.'}
                  </p>
                  <div className="flex items-center justify-center space-x-2 pt-2">
                    <button
                      onClick={() => {
                        setNewFolderName('');
                        setIsCreatingFolder(true);
                      }}
                      className="px-4 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer inline-flex items-center space-x-1"
                    >
                      <Folder className="w-3.5 h-3.5" />
                      <span>+ Create Folder</span>
                    </button>
                    <button
                      onClick={() => setEditingItem({ status: 'published', type: 'pdf', parentId: currentFolderId })}
                      className="px-4 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer inline-flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Content</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      <th className="p-4">Material / Module</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Link / Source</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedItems.map(item => {
                      const isFolder = item.type === 'folder';
                      const childCount = isFolder ? courseItems.filter(ci => ci.parentId === item.id).length : 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isFolder ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                item.type === 'pdf' ? 'bg-red-50 text-red-500' :
                                item.type === 'youtube' ? 'bg-rose-50 text-rose-600' :
                                item.type === 'html' ? 'bg-emerald-50 text-emerald-600' :
                                'bg-blue-50 text-blue-500'
                              }`}>
                                {isFolder ? <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" /> :
                                 item.type === 'pdf' ? <FileText className="w-5 h-5 text-red-500" /> :
                                 item.type === 'youtube' ? <Youtube className="w-5 h-5 text-rose-600" /> :
                                 item.type === 'html' ? <Code className="w-5 h-5 text-emerald-600" /> :
                                 <Link2 className="w-5 h-5 text-blue-500" />}
                              </div>
                              <div>
                                {isFolder ? (
                                  <button
                                    onClick={() => setCurrentFolderId(item.id)}
                                    className="font-bold text-slate-900 text-sm hover:text-indigo-600 text-left cursor-pointer flex items-center space-x-1.5"
                                  >
                                    <span>{item.name}</span>
                                    <span className="text-[11px] font-normal text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                      {childCount} items &rarr;
                                    </span>
                                  </button>
                                ) : (
                                  <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                                )}
                                {item.description && (
                                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`uppercase text-[10px] font-extrabold px-2 py-0.5 rounded ${
                              isFolder ? 'bg-amber-100 text-amber-800' :
                              item.type === 'youtube' ? 'bg-rose-100 text-rose-800' :
                              item.type === 'pdf' ? 'bg-red-100 text-red-800' :
                              item.type === 'html' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {item.type}
                            </span>
                          </td>

                          <td className="p-4">
                            {isFolder ? (
                              <span className="text-xs text-slate-400 italic">Folder Directory</span>
                            ) : (
                              <span className="text-xs font-mono text-slate-600 truncate max-w-[200px] block" title={item.fileUrl}>
                                {item.fileUrl || (item.content ? 'Inline Content' : 'No URL')}
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {isFolder ? (
                                <button
                                  onClick={() => setCurrentFolderId(item.id)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors cursor-pointer"
                                  title="Open Folder"
                                >
                                  Open &rarr;
                                </button>
                              ) : item.fileUrl && (
                                <a
                                  href={item.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                                  title="Test Link"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => setEditingItem(item)}
                                className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors cursor-pointer"
                                title="Edit Item"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                title="Delete Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>

      ) : (

        /* ---------------- ALL PREMIUM COURSES ---------------- */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Courses Catalog</h3>
              <p className="text-xs text-slate-500">Create courses and manage study materials inside each course.</p>
            </div>
            <button 
              onClick={() => setEditingCourse({ status: 'published', price: 999 })}
              className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition cursor-pointer self-start sm:self-auto w-full sm:w-auto active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-all">
                <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden">
                  {course.bannerUrl ? (
                    <img src={course.bannerUrl} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-indigo-300" />
                    </div>
                  )}

                  {/* Pulsing Live Badge if live now */}
                  {course.isLive ? (
                    <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shadow-md flex items-center space-x-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                      <span>LIVE NOW</span>
                    </div>
                  ) : course.liveScheduledTime ? (
                    <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur text-slate-200 font-bold text-[10px] px-2 py-0.5 rounded-lg flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{course.liveScheduledTime}</span>
                    </div>
                  ) : null}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{course.branch || 'General'}</span>
                    <span className="font-extrabold text-base text-emerald-600">₹{course.price}</span>
                  </div>
                  
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight mb-2">{course.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1">{course.description}</p>
                  
                  {/* YouTube Live Stream Controls Bar on Card */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <Radio className={`w-4 h-4 shrink-0 ${course.isLive ? 'text-red-600 animate-pulse' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-[11px] truncate">
                          {course.isLive 
                            ? 'Broadcast: Live Now 🔴' 
                            : (course.liveYoutubeUrl ? 'Stream Configured' : 'No Live Stream Set')}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {course.liveTopic || (course.liveScheduledTime ? `Sched: ${course.liveScheduledTime}` : 'Click edit to set stream')}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCourseLive(course)}
                      className={`px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                        course.isLive 
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs' 
                          : 'bg-slate-200 hover:bg-emerald-600 hover:text-white text-slate-700'
                      }`}
                      title={course.isLive ? 'End Live Broadcast' : 'Start Live Broadcast'}
                    >
                      {course.isLive ? 'End Live' : 'Go Live'}
                    </button>
                  </div>

                  {/* Actions inside course card */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={() => handleOpenCourseContent(course)}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Manage Content & Materials</span>
                    </button>
                    
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingCourse(course)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Edit Course Details & Live Stream"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {courses.length === 0 && (
              <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                <Book className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Courses Created Yet</h3>
                <p className="text-xs text-slate-500">Create your first premium course to start assigning it to students.</p>
                <button 
                  onClick={() => setEditingCourse({ status: 'published', price: 999 })}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow hover:bg-indigo-700 cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Course</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- MODAL: EDIT USER & COURSE ALLOCATION ---------------- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
            <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-base">Assign Courses & Manage Access</h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Student Header */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center space-x-3">
                {editingUser.photoUrl ? (
                  <img
                    src={editingUser.photoUrl}
                    alt={editingUser.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black shrink-0">
                    {editingUser.name ? editingUser.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">{editingUser.name}</h4>
                  <p className="text-xs text-slate-500 font-mono truncate">{editingUser.email}</p>
                  <p className="text-[11px] text-slate-400">{editingUser.mobile}</p>
                </div>
              </div>

              {/* Status and Login ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Approval Status *
                  </label>
                  <select 
                    value={editStatus} 
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="approved">Approved (Active Access)</option>
                    <option value="pending">Pending Approval</option>
                    <option value="rejected">Rejected / Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Login ID *
                  </label>
                  <input 
                    type="text" 
                    value={editId} 
                    onChange={e => setEditId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="e.g. PH-1001"
                  />
                </div>
              </div>

              {/* ---------------- COURSE SELECTION BOX ---------------- */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                      Select Courses for this Student
                    </span>
                    <span className="text-[10px] text-indigo-700 font-medium">
                      Student will ONLY see the courses checked below ({selectedCourseIds.length} selected).
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAllCourses}
                      className="px-2 py-1 rounded bg-white hover:bg-indigo-100 text-[10px] font-bold text-indigo-700 border border-indigo-200 cursor-pointer transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllCourses}
                      className="px-2 py-1 rounded bg-white hover:bg-rose-50 text-[10px] font-bold text-rose-600 border border-slate-200 cursor-pointer transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {courses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-white rounded-xl">
                    No courses created yet. Please create courses in the Courses tab first.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {courses.map(course => {
                      const isChecked = selectedCourseIds.includes(course.id);
                      return (
                        <div
                          key={course.id}
                          onClick={() => handleToggleCourseSelection(course.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-white border-indigo-500 shadow-xs' 
                              : 'bg-white/60 border-slate-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate ${isChecked ? 'text-indigo-950' : 'text-slate-700'}`}>
                                {course.name}
                              </p>
                              {course.branch && (
                                <p className="text-[10px] text-slate-400">{course.branch}</p>
                              )}
                            </div>
                          </div>
                          
                          <span className="text-[11px] font-bold text-emerald-600 font-mono shrink-0">
                            ₹{course.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-1 text-[11px] text-slate-600 font-medium">
                  {selectedCourseIds.length === 0 ? (
                    <span className="text-amber-700 font-semibold">⚠️ 0 courses selected (Student will see no courses).</span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">✓ {selectedCourseIds.length} course{selectedCourseIds.length > 1 ? 's' : ''} will be unlocked for this student.</span>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex justify-end space-x-2.5 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)} 
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save & Allocate Courses'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREATE / EDIT COURSE ---------------- */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
            <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
              <h3 className="font-extrabold text-base">{editingCourse.id ? 'Edit Course' : 'Create New Premium Course'}</h3>
              <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-white p-1 text-lg cursor-pointer">&times;</button>
            </div>
            
            <form onSubmit={handleSaveCourse} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Name *</label>
                <input 
                  required
                  type="text" 
                  value={editingCourse.name || ''} 
                  onChange={e => setEditingCourse({...editingCourse, name: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. Electrical Engineering Complete Masterclass"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input 
                    required
                    type="number" 
                    value={editingCourse.price || 0} 
                    onChange={e => setEditingCourse({...editingCourse, price: parseFloat(e.target.value) || 0})}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch / Category</label>
                  <input 
                    type="text" 
                    value={editingCourse.branch || ''} 
                    onChange={e => setEditingCourse({...editingCourse, branch: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="e.g. Electrical Engineering (EE)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Banner Image URL (Standard 16:9 Aspect Ratio)
                </label>
                <input 
                  type="url" 
                  value={editingCourse.bannerUrl || ''} 
                  onChange={e => setEditingCourse({...editingCourse, bannerUrl: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="https://example.com/banner.jpg"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Recommended Aspect Ratio: <strong>16:9</strong> (e.g. <strong>1280 × 720 px</strong> or <strong>1920 × 1080 px</strong>). Fits 100% perfectly without any cropping.
                </p>
                {editingCourse.bannerUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 aspect-[16/9] w-48 bg-slate-100">
                    <img src={editingCourse.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={editingCourse.description || ''} 
                  onChange={e => setEditingCourse({...editingCourse, description: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                  placeholder="Comprehensive theory notes, handwritten numericals, and masterclass videos..."
                />
              </div>

              {/* ---------------- YOUTUBE UNLISTED LIVE CLASSES SECTION ---------------- */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-4 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white">YouTube Unlisted Live Classes</h4>
                      <p className="text-[10px] text-slate-400">Stream private unlisted lectures directly to enrolled students</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLiveGuide(prev => !prev)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Setup Guide</span>
                    {showLiveGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Collapsible Setup Guide */}
                {showLiveGuide && (
                  <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-2.5 leading-relaxed animate-fade-in">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-extrabold">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>YouTube Studio आवश्यक सेटिंग्स ('Playback disabled' एरर से बचने के लिए):</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                      <li><a href="https://studio.youtube.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">YouTube Studio</a> खोलें &rarr; <strong>"Go Live"</strong> या <strong>Content &rarr; Live</strong> पर जाएँ।</li>
                      <li>Stream Details में <strong>Visibility</strong> को <strong className="text-white">"Unlisted"</strong> रखें (Private वीडियो external sites पर ब्लॉक होते हैं)।</li>
                      <li>नीचे <strong>"Show More"</strong> पर क्लिक करें और <strong>License and distribution</strong> में <strong className="text-emerald-400">"Allow embedding" (एम्बेड करने की अनुमति दें)</strong> चेकबॉक्स को अवश्य टिक (ON) करें।</li>
                      <li><strong>Age Restriction:</strong> "No, it's not made for kids" और "Don't restrict my video to viewers over 18" सेट रखें।</li>
                      <li>Stream URL या 11-अक्षरों का Video ID नीचे पेस्ट करें और "Test Playback" बटन दबाकर जांचें।</li>
                      <li>क्लास शुरू होने पर <strong className="text-emerald-400">"Is Live Now"</strong> को ON करें ताकि सभी छात्रों को तुरंत नोटिफिकेशन और Live Badge मिल सके!</li>
                    </ol>
                  </div>
                )}

                {/* 1. Live Stream YouTube URL or Video ID */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-200">
                      Live Stream YouTube URL or Video ID
                    </label>
                    {editingCourse.liveYoutubeUrl && extractYoutubeId(editingCourse.liveYoutubeUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          const id = extractYoutubeId(editingCourse.liveYoutubeUrl!);
                          setPreviewEmbedId(previewEmbedId === id ? null : id);
                        }}
                        className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>{previewEmbedId ? 'Hide Test Player' : 'Test Playback Embed'}</span>
                      </button>
                    )}
                  </div>
                  <input 
                    type="text" 
                    value={editingCourse.liveYoutubeUrl || ''} 
                    onChange={e => setEditingCourse({...editingCourse, liveYoutubeUrl: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="https://youtube.com/live/VIDEO_ID or watch?v=... or 11-char ID"
                  />
                  {editingCourse.liveYoutubeUrl && (
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      {extractYoutubeId(editingCourse.liveYoutubeUrl) ? (
                        <span className="text-emerald-400 font-mono font-bold flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Detected Video ID: {extractYoutubeId(editingCourse.liveYoutubeUrl)}</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium">Please enter a valid YouTube video link or 11-char ID</span>
                      )}
                    </div>
                  )}

                  {/* Test Embed Preview Container */}
                  {previewEmbedId && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                        <span>Preview Test Player (Origin: {typeof window !== 'undefined' ? window.location.hostname : ''}):</span>
                        <a 
                          href={`https://www.youtube.com/watch?v=${previewEmbedId}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-red-400 hover:text-red-300 flex items-center space-x-1 text-[11px]"
                        >
                          <span>Open on YouTube</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="aspect-video w-full max-w-sm mx-auto rounded-lg overflow-hidden border border-slate-800 bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${previewEmbedId}?autoplay=0&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
                          title="Admin Test Embed"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">
                        अगर यहाँ <em>'Playback on other websites has been disabled'</em> दिखे, तो YouTube Studio में जाकर "Allow embedding" चेक करें।
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Is Live Now Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      "Is Live Now" Status
                    </span>
                    <span className="text-[10px] text-slate-400">
                      When enabled, a pulsing LIVE NOW badge is shown on student dashboard & course cards.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingCourse({...editingCourse, isLive: !editingCourse.isLive})}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                      editingCourse.isLive 
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${editingCourse.isLive ? 'bg-white' : 'bg-slate-500'}`} />
                    <span>{editingCourse.isLive ? 'Active (LIVE)' : 'Inactive'}</span>
                  </button>
                </div>

                {/* 3. Live Scheduled Time & Topic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Live Scheduled Time (Optional)
                    </label>
                    <input 
                      type="text" 
                      value={editingCourse.liveScheduledTime || ''} 
                      onChange={e => setEditingCourse({...editingCourse, liveScheduledTime: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="e.g. Live on Today at 6:00 PM"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Live Class Topic / Description
                    </label>
                    <input 
                      type="text" 
                      value={editingCourse.liveTopic || ''} 
                      onChange={e => setEditingCourse({...editingCourse, liveTopic: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="e.g. Unit 3 Numerical Masterclass"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visibility Status</label>
                <select
                  value={editingCourse.status || 'published'}
                  onChange={e => setEditingCourse({...editingCourse, status: e.target.value as any})}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="published">Published (Available for students)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>
              
              <div className="pt-3 flex justify-end space-x-2.5 border-t border-slate-100">
                <button type="button" onClick={() => setEditingCourse(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingCourse} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm cursor-pointer disabled:opacity-50">
                  {isSavingCourse ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: ADD / EDIT COURSE ITEM / CONTENT ---------------- */}
      {editingItem && managingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
            <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-base">
                  {editingItem.id ? 'Edit Content Item' : 'Add Content to Course'}
                </h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white p-1 text-lg cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                  Target Course: {managingCourse.name}
                </span>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content Title / Module Name *</label>
                <input 
                  required
                  type="text" 
                  value={editingItem.name || ''} 
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. Module 1: DC Machines Handwritten Theory Notes"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Content Type *</label>
                  <select
                    value={editingItem.type || 'pdf'}
                    onChange={e => setEditingItem({...editingItem, type: e.target.value as any})}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="pdf">PDF Document / Drive Link</option>
                    <option value="youtube">YouTube Video Lecture</option>
                    <option value="link">Web Link / Resource</option>
                    <option value="html">HTML / Notes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingItem.status || 'published'}
                    onChange={e => setEditingItem({...editingItem, status: e.target.value as any})}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* TYPE-SPECIFIC CONTENT INPUTS */}
              {editingItem.type === 'pdf' && (
                <div className="space-y-1.5 p-3.5 bg-red-50/60 rounded-2xl border border-red-200/80">
                  <label className="block text-xs font-bold text-red-950">
                    Google Drive PDF Link / Direct PDF URL *
                  </label>
                  <input 
                    required
                    type="text" 
                    value={editingItem.fileUrl || ''} 
                    onChange={e => setEditingItem({...editingItem, fileUrl: e.target.value})}
                    className="w-full bg-white border border-red-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                  />
                  <p className="text-[11px] text-red-700">
                    Enter Google Drive share link (Anyone with the link can view) or direct PDF URL. This will open in a clean, full-screen landscape viewer for students.
                  </p>
                </div>
              )}

              {editingItem.type === 'youtube' && (
                <div className="space-y-1.5 p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200/80">
                  <label className="block text-xs font-bold text-rose-950 flex items-center space-x-1.5">
                    <Youtube className="w-4 h-4 text-rose-600" />
                    <span>Video Iframe HTML Code / Embed Code (or Video Link) *</span>
                  </label>
                  <textarea 
                    required
                    rows={3}
                    value={editingItem.fileUrl || ''} 
                    onChange={e => setEditingItem({...editingItem, fileUrl: e.target.value})}
                    className="w-full bg-white border border-rose-200 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-rose-500 outline-none resize-y" 
                    placeholder={`<iframe width="560" height="315" src="https://www.youtube.com/embed/..." title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`}
                  />
                  <p className="text-[11px] text-rose-700">
                    Paste YouTube <strong>Iframe HTML code</strong> (or video link) here. When clicked, videos play automatically in <strong>original fullscreen landscape orientation</strong>.
                  </p>
                </div>
              )}

              {editingItem.type === 'html' && (
                <div className="space-y-3 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                      <Code className="w-4 h-4 text-emerald-600" />
                      <span>HTML Notes Content (Direct Database Storage)</span>
                    </label>
                  </div>

                  {/* HTML File Upload Option */}
                  <div className="bg-white p-3 rounded-xl border border-dashed border-emerald-300 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">HTML File Upload</span>
                        <span className="text-[10px] text-slate-500">Choose a .html file (content will be auto-pasted below)</span>
                      </div>
                    </div>
                    <label className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-colors shrink-0">
                      <span>Browse .html</span>
                      <input 
                        type="file" 
                        accept=".html,.htm" 
                        onChange={handleHtmlFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* HTML Code Textarea */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Paste HTML Code directly:
                    </label>
                    <textarea 
                      rows={6}
                      value={editingItem.content || ''} 
                      onChange={e => setEditingItem({...editingItem, content: e.target.value, fileUrl: 'html-content'})}
                      className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none resize-y" 
                      placeholder="<h1>Chapter 1: Theory & Formulae</h1>&#10;<p>Paste HTML notes content here...</p>"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>Stored securely in database with zero server storage overhead.</span>
                      <span>{editingItem.content ? `${editingItem.content.length} characters` : 'Empty'}</span>
                    </div>
                  </div>
                </div>
              )}

              {editingItem.type === 'link' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Website / Resource Link URL *
                  </label>
                  <input 
                    required
                    type="url" 
                    value={editingItem.fileUrl || ''} 
                    onChange={e => setEditingItem({...editingItem, fileUrl: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="https://example.com/notes"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Summary (Optional)</label>
                <textarea 
                  rows={2}
                  value={editingItem.description || ''} 
                  onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none" 
                  placeholder="Details of topics covered in this module..."
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2.5 border-t border-slate-100">
                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingItem} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm cursor-pointer disabled:opacity-50">
                  {isSavingItem ? 'Saving...' : 'Save Content Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREATE FOLDER IN COURSE ---------------- */}
      {isCreatingFolder && managingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Create New Folder</h3>
              </div>
              <button onClick={() => setIsCreatingFolder(false)} className="text-slate-400 hover:text-white p-1 text-lg cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleCreateFolder} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Folder Name *</label>
                <input 
                  required
                  type="text" 
                  value={newFolderName} 
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none" 
                  placeholder="e.g. Unit 1: Theory Notes, Video Lectures..."
                  autoFocus
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  You can store video lectures, PDFs, HTML notes, and sub-folders inside this folder.
                </p>
              </div>

              <div className="pt-3 flex justify-end space-x-2.5 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreatingFolder(false)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-sm cursor-pointer">
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
