import { AdminPremiumManager } from './AdminPremiumManager';
import React, { useState, useEffect, useMemo } from 'react';
import {
  MonitorPlay,
  Youtube,
  Trash,
  Save,

  Folder, Link2,
  FileText,
  Code,
  Plus,
  Upload,
  Trash2,
  Edit3,
  Move,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  RefreshCw,
  FolderPlus,
  Search,
  ChevronRight,
  ArrowLeft,
  SlidersHorizontal,
  FileCode,
  Sparkles,
  AlertTriangle,
  X,
  Lock,
  Layers,
  FolderOpen
} from 'lucide-react';
import { StudyItem, LibraryStats, BreadcrumbItem } from '../types';
import { api } from '../services/api';
import { formatFileSize, formatDate } from '../utils/formatters';

interface AdminDashboardProps {
  onOpenFile: (file: StudyItem) => void;
  onRefreshPublicData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenFile,
  onRefreshPublicData
}) => {
  const [items, setItems] = useState<StudyItem[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // File Manager Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'manager' | 'overview' | 'all-files' | 'studiverse' | 'premium' | 'feedback'>('manager');
  const [liveEmbed, setLiveEmbed] = useState<string>('');
  const [videos, setVideos] = useState<any[]>([]);
  const [studiverseLoading, setStudiverseLoading] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');

  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  useEffect(() => {
    if (activeTab === 'feedback') {
      loadFeedbacks();
    }
  }, [activeTab]);

  const loadFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const data = await api.getFeedback();
      setFeedbacks(data);
    } catch (err) {
      console.error('Failed to load feedback', err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };


  const loadStudiverse = async () => {
    try {
      const data = await api.getStudiverseData();
      setLiveEmbed(data.liveEmbed || '');
      setVideos(data.videos || []);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { loadStudiverse(); }, []);


  // Modals state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateHtmlModal, setShowCreateHtmlModal] = useState(false);
  
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');
  const [linkStatus, setLinkStatus] = useState<'published' | 'draft'>('published');

  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [youtubeName, setYoutubeName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeDesc, setYoutubeDesc] = useState('');
  const [youtubeStatus, setYoutubeStatus] = useState<'published' | 'draft'>('published');
  const [renameItem, setRenameItem] = useState<StudyItem | null>(null);
  const [moveItem, setMoveItem] = useState<StudyItem | null>(null);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<StudyItem | null>(null);
  const [previewItem, setPreviewItem] = useState<StudyItem | null>(null);

  // Form states
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderStatus, setNewFolderStatus] = useState<'published' | 'draft'>('published');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [newFolderBranch, setNewFolderBranch] = useState('Computer Science');
  const [newFolderSemester, setNewFolderSemester] = useState('Semester 1');
  const [newFolderAccessType, setNewFolderAccessType] = useState<"free"|"premium"|"both">("both");
  const [newFolderIsPremium, setNewFolderIsPremium] = useState(false);

  const [uploadFileObj, setUploadFileObj] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'published' | 'draft'>('published');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadAccessType, setUploadAccessType] = useState<"free"|"premium"|"both">("both");
  const [uploadIsPremium, setUploadIsPremium] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [htmlNoteName, setHtmlNoteName] = useState('');
  const [htmlNoteContent, setHtmlNoteContent] = useState('');
  const [htmlNoteStatus, setHtmlNoteStatus] = useState<'published' | 'draft'>('published');
  const [htmlNoteDesc, setHtmlNoteDesc] = useState('');
  const [htmlNoteAccessType, setHtmlNoteAccessType] = useState<"free"|"premium"|"both">("both");
  const [htmlNoteIsPremium, setHtmlNoteIsPremium] = useState(false);

  const [renameValue, setRenameValue] = useState('');
  const [renameUrlValue, setRenameUrlValue] = useState('');
  const [selectedDestinationFolder, setSelectedDestinationFolder] = useState<string | null>(null);

  // Load Admin tree
  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminTree();
      setItems(data.items);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
    onRefreshPublicData();
  };

  // Compute breadcrumbs
  const breadcrumbs = useMemo(() => {
    const crumbs: BreadcrumbItem[] = [{ id: null, name: 'Root (Polytechnic Library)' }];
    if (!currentFolderId) return crumbs;

    const pathList: BreadcrumbItem[] = [];
    let currId: string | null = currentFolderId;

    while (currId) {
      const found = items.find(i => i.id === currId);
      if (!found) break;
      pathList.unshift({ id: found.id, name: found.name });
      currId = found.parentId;
    }

    return [...crumbs, ...pathList];
  }, [currentFolderId, items]);

  // Current folder's children
  const currentChildren = useMemo(() => {
    return items.filter(item => {
      if (currentFolderId === null) {
        return item.parentId === null;
      }
      return item.parentId === currentFolderId;
    });
  }, [items, currentFolderId]);

  // Filtered by search
  const filteredChildren = useMemo(() => {
    if (!searchQuery.trim()) return currentChildren;
    const q = searchQuery.toLowerCase().trim();
    return currentChildren.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q))
    );
  }, [currentChildren, searchQuery]);

  // Current folder object
  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return items.find(i => i.id === currentFolderId) || null;
  }, [currentFolderId, items]);

  // All folders for Move Destination selection
  const allFolders = useMemo(() => {
    return items.filter(i => i.type === 'folder');
  }, [items]);

  // Handlers
  
  const handleCreateYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeName.trim() || !youtubeUrl.trim() || !currentFolderId) return;

    setLoading(true);
    try {
      await api.createFileRecord(
        youtubeName.trim(),
        'youtube',
        youtubeUrl.trim(),
        0,
        currentFolderId,
        youtubeStatus,
        youtubeDesc.trim(),
        newFolderBranch,
        newFolderSemester
      );
      setShowYoutubeModal(false);
      setYoutubeName('');
      setYoutubeUrl('');
      setYoutubeDesc('');
      triggerSuccess('YouTube video added successfully.');
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to add YouTube video');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkName.trim() || !linkUrl.trim() || !currentFolderId) return;

    setLoading(true);
    try {
      await api.createFileRecord(
        linkName.trim(),
        'link',
        linkUrl.trim(),
        0,
        currentFolderId,
        linkStatus,
        linkDesc.trim(),
        newFolderBranch,
        newFolderSemester
      );
      setShowLinkModal(false);
      setLinkName('');
      setLinkUrl('');
      setLinkDesc('');
      triggerSuccess('Link added successfully.');
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to add link');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await api.createFolder(newFolderName.trim(), currentFolderId, newFolderStatus, newFolderDesc, newFolderBranch, newFolderSemester, newFolderAccessType === "premium", newFolderAccessType);
      setShowNewFolderModal(false);
      setNewFolderName('');
      setNewFolderDesc('');
      setNewFolderIsPremium(false);
      setNewFolderAccessType("both");
      triggerSuccess(`Folder "${newFolderName}" created successfully.`);
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Could not create folder');
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileObj) return;

    setUploading(true);
    try {
      // Import storage dynamically or at top. We will import at top.
      const { storage } = await import('../firebase');
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      
      const fileRef = ref(storage, `study-materials/${Date.now()}_${uploadFileObj.name}`);
      await uploadBytes(fileRef, uploadFileObj);
      const fileUrl = await getDownloadURL(fileRef);

      const ext = uploadFileObj.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'html';
      
      await api.createFileRecord(
        uploadFileObj.name,
        ext,
        fileUrl,
        uploadFileObj.size,
        currentFolderId,
        uploadStatus,
        uploadDesc,
        newFolderBranch,
        newFolderSemester
      );
      
      setShowUploadModal(false);
      setUploadFileObj(null);
      setUploadDesc('');
      setUploadIsPremium(false);
      setUploadAccessType("both");
      triggerSuccess(`File "${uploadFileObj.name}" uploaded successfully (${uploadStatus}).`);
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  
  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeName.trim() || !youtubeUrl.trim()) return;
    setLoading(true);
    try {
      await api.createFileRecord(
        youtubeName.trim(),
        'youtube',
        youtubeUrl.trim(),
        0,
        currentFolderId,
        youtubeStatus,
        youtubeDesc,
        newFolderBranch,
        newFolderSemester
      );
      setShowYoutubeModal(false);
      setYoutubeName('');
      setYoutubeUrl('');
      setYoutubeDesc('');
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to add YouTube video');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHtmlNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlNoteName.trim() || !htmlNoteContent.trim()) return;

    try {
      await api.createHtmlNote(htmlNoteName.trim(), htmlNoteContent, currentFolderId, htmlNoteStatus, htmlNoteDesc, newFolderBranch, newFolderSemester);
      setShowCreateHtmlModal(false);
      setHtmlNoteName('');
      setHtmlNoteContent('');
      setHtmlNoteDesc('');
      setHtmlNoteIsPremium(false);
      setHtmlNoteAccessType("both");
      triggerSuccess(`Interactive note "${htmlNoteName}" created successfully.`);
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Could not save HTML note');
    }
  };

  const handleTogglePublish = async (item: StudyItem) => {
    const newStatus = item.status === 'published' ? 'unpublished' : 'published';
    try {
      await api.updateItem(item.id, { status: newStatus });
      triggerSuccess(`Status updated to "${newStatus}" for "${item.name.replace(/\.(pdf|html)$/i, '')}".`);
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Status change failed');
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameItem || !renameValue.trim()) return;

    let finalName = renameValue.trim();
    // Maintain extension if renaming a file
    
    

    try {
      await api.updateItem(renameItem.id, { name: finalName, ...(renameItem.type === 'youtube' || renameItem.type === 'link' ? { fileUrl: renameUrlValue.trim() } : {}) });
      setRenameItem(null);
      setRenameValue('');
      triggerSuccess(`Item renamed to "${finalName}".`);
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Rename failed');
    }
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveItem) return;

    try {
      await api.updateItem(moveItem.id, { parentId: selectedDestinationFolder });
      setMoveItem(null);
      setSelectedDestinationFolder(null);
      triggerSuccess(`"${moveItem.name}" moved successfully.`);
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Move failed');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteItemConfirm) return;

    try {
      const res = await api.deleteItem(deleteItemConfirm.id);
      setDeleteItemConfirm(null);
      triggerSuccess(`Deleted ${res.count} item(s) successfully.`);
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div id="polytechnic-admin-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Tabs */}
      <div className="flex items-center space-x-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('manager')}
          className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'manager' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          File Manager
        </button>
        <button 
          onClick={() => setActiveTab('premium')}
          className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-1 ${activeTab === 'premium' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Lock className="w-4 h-4 mr-1"/>
          Premium Courses
        </button>
      
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'feedback' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          User Feedback
        </button>
      </div>

      {activeTab === 'premium' && (
        <AdminPremiumManager />
      )}

      
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-800">User Feedback & Suggestions</h2>
              <p className="text-slate-500 text-sm mt-1">Review feedback submitted via the About page.</p>
            </div>
            <button 
              onClick={loadFeedbacks}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
            >
              Refresh
            </button>
          </div>
          
          <div className="p-6">
            {loadingFeedbacks ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No feedback submissions found.
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((item) => (
                  <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800">{item.name}</h3>
                        <div className="flex gap-4 text-sm text-slate-500 mt-1">
                          <span>📧 {item.email}</span>
                          <span>📱 {item.mobile}</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-200 px-2 py-1 rounded">
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-3 text-slate-700 bg-white p-3 rounded border border-slate-100 text-sm">
                      {item.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'manager' && (
        <>

      
      {/* HEADER BAR */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Central Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Control & File Manager</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage Polytechnic folders, upload files, organize materials, and control public visibility.
          </p>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 shadow-sm hidden">
          <span className="text-xs text-slate-400 font-semibold block">External Links</span>
          <span className="text-2xl font-black text-slate-200 font-mono mt-1 block">{stats?.totalLinks ?? 0}</span>
        </div>
      </div>

      {/* TOASTS / ALERTS */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 rounded-xl text-sm font-semibold flex items-center space-x-2 animate-fade-in shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-600 text-rose-300 rounded-xl text-sm font-semibold flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Folders</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{stats?.totalFolders ?? 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Files</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{stats?.totalFiles ?? 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Files</span>
          <span className="text-2xl font-black text-rose-600 font-mono mt-1 block">{stats?.totalFiles ?? 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Study Guides</span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{stats?.totalFiles ?? 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-sm">
          <span className="text-xs text-emerald-700 font-semibold block">Published (Public)</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">{stats?.publishedCount ?? 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-sm">
          <span className="text-xs text-amber-700 font-semibold block">Drafts / Hidden</span>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">{stats?.draftCount ?? 0}</span>
        </div>
      </div>

      {/* CLOUD FILE MANAGER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        
        {/* ACTION TOOLBAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Breadcrumb Path */}
          <div className="flex items-center flex-wrap gap-1 text-xs font-semibold text-slate-600">
            {currentFolderId && (
              <button
                onClick={() => {
                  const parent = currentFolder ? currentFolder.parentId : null;
                  setCurrentFolderId(parent);
                }}
                className="mr-1.5 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1"
                title="Up one level"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Up</span>
              </button>
            )}

            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.id || 'root'}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                  <button
                    onClick={() => setCurrentFolderId(crumb.id)}
                    className={`px-2 py-1 rounded transition-colors ${
                      isLast
                        ? 'bg-blue-100 text-blue-800 font-bold'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Creation & Upload Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="admin-new-folder-btn"
              onClick={() => setShowNewFolderModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ New Folder</span>
            </button>
            <button
              id="admin-upload-file-btn"
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </button>

            
            <button
              onClick={() => setShowYoutubeModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Youtube className="w-4 h-4" />
              <span>Add YouTube</span>
            </button>

                  <button
                    onClick={() => setShowLinkModal(true)}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-teal-50 border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-teal-900">Add Link</span>
                  </button>


            <button
              id="admin-create-html-btn"
              onClick={() => setShowCreateHtmlModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>+ Write Note</span>
            </button>
          </div>

        </div>

        {/* SEARCH BAR WITHIN MANAGER */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items in current directory..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* ITEMS LIST TABLE */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Size / Items</th>
                <th className="py-3 px-3">Last Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChildren.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">This folder is empty</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Start by creating a subfolder or uploading materials.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredChildren.map((item) => {
                  const isFolder = item.type === 'folder';
                  const isPdf = item.type === 'pdf';
                  const isPublished = item.status === 'published';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      {/* Name & Icon */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => {
                            if (isFolder) setCurrentFolderId(item.id);
                            else onOpenFile(item);
                          }}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isFolder
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {isFolder ? <Folder className="w-4 h-4 fill-blue-500/20" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block">
                              {item.name.replace(/\.(pdf|html)$/i, '')}
                            </span>
                            {item.description && (
                              <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 font-mono uppercase text-[11px]">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          isFolder
                            ? 'bg-blue-50 text-blue-700'
                            : isPdf
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {item.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          title={`Click to ${isPublished ? 'Unpublish' : 'Publish to Students'}`}
                        >
                          {isPublished ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-amber-600" />
                              <span>Draft / Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Size or Child count */}
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {isFolder ? `${item.itemCount ?? 0} items` : formatFileSize(item.size)}
                      </td>

                      {/* Last Modified */}
                      <td className="py-3 px-3 text-slate-500">
                        {formatDate(item.updatedAt || item.createdAt)}
                      </td>

                      {/* Action Menu */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* Preview / Open */}
                          <button
                            onClick={() => {
                              if (isFolder) setCurrentFolderId(item.id);
                              else onOpenFile(item);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title={isFolder ? 'Open Folder' : 'Preview Study Note'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Rename */}
                          <button
                            onClick={() => {
                              setRenameItem(item);
                              setRenameValue(item.name);
                              setRenameUrlValue(item.fileUrl || '');
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            title="Rename"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Move */}
                          <button
                            onClick={() => {
                              setMoveItem(item);
                              setSelectedDestinationFolder(item.parentId);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            title="Move to another folder"
                          >
                            <Move className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteItemConfirm(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      
        </>
      )}
      
      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW FOLDER (Unlimited Nesting) */}
      {/* ========================================================================= */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Create New Folder</h3>
              </div>
              <button onClick={() => setShowNewFolderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Creating folder inside: <strong>{currentFolder ? currentFolder.name : 'Root Library'}</strong>
            </p>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Folder Name *</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Unit 3 - AC Circuits"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Optional Description</label>
                <input
                  type="text"
                  value={newFolderDesc}
                  onChange={(e) => setNewFolderDesc(e.target.value)}
                  placeholder="e.g. Lecture slides, derivations and question sets"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Initial Visibility</label>
                <select
                  value={newFolderStatus}
                  onChange={(e) => setNewFolderStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                >
                  <option value="published">Published (Instantly visible to students)</option>
                  <option value="draft">Draft (Admin only until reviewed)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      
      
      
      {/* ========================================================================= */}
      {/* UPLOAD FILE MODAL */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Upload File</h3>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Uploading to: <strong>{currentFolder ? currentFolder.name : 'Root Library'}</strong>
            </p>

            <form onSubmit={handleUploadFile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select File (PDF, HTML, etc)</label>
                <input 
                  type="file" 
                  onChange={(e) => setUploadFileObj(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description (Optional)</label>
                <input 
                  type="text" 
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="e.g. 2023 Previous Year Paper"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Initial Visibility</label>
                <select 
                  value={uploadStatus}
                  onChange={(e) => setUploadStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <div className="mt-4 mb-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Audience</label>
                <select value={uploadAccessType} onChange={e => setUploadAccessType(e.target.value as any)} className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white text-sm">
                  <option value="both">Both (Free & Premium Users)</option>
                  <option value="free">Free Users Only</option>
                  <option value="premium">Premium Users Only (Requires Registration)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFileObj}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload File</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD LINK MODAL */}
      {/* ========================================================================= */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                  <Link2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Add External Link</h3>
              </div>
              <button 
                onClick={() => setShowLinkModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Link Title</label>
                <input 
                  type="text" 
                  value={linkName} 
                  onChange={e => setLinkName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                  placeholder="e.g. Reference Documentation"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">URL</label>
                <input 
                  type="url" 
                  value={linkUrl} 
                  onChange={e => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>Description (Optional)</span>
                </label>
                <textarea 
                  value={linkDesc} 
                  onChange={e => setLinkDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none resize-none h-20"
                  placeholder="What is this link about?"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Visibility Status</label>
                <select
                  value={linkStatus}
                  onChange={(e: any) => setLinkStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none"
                >
                  <option value="published">Published (Visible to students)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showYoutubeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                  <Youtube className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Add YouTube Video</h3>
              </div>
              <button onClick={() => setShowYoutubeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleYoutubeSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Video Title</label>
                <input 
                  type="text" 
                  value={youtubeName} 
                  onChange={e => setYoutubeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                  placeholder="e.g. Intro to Computer Networks"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">URL (YouTube or Link)</label>
                <input 
                  type="url" 
                  value={youtubeUrl} 
                  onChange={e => setYoutubeUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Status</label>
                <select 
                  value={youtubeStatus}
                  onChange={e => setYoutubeStatus(e.target.value as 'published' | 'draft')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                >
                  <option value="published">Published (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowYoutubeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !youtubeName.trim() || !youtubeUrl.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE HTML STUDY NOTE DIRECTLY */}
      {/* ========================================================================= */}
      {showCreateHtmlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Create Study Note</h3>
              </div>
              <button onClick={() => setShowCreateHtmlModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHtmlNote} className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Note Title *</label>
                <input
                  type="text"
                  value={htmlNoteName}
                  onChange={(e) => setHtmlNoteName(e.target.value)}
                  placeholder="e.g. Thevenin Theorem Interactive Guide.html"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Branch</label>
                <select value={newFolderBranch} onChange={(e) => setNewFolderBranch(e.target.value)} className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl">
                  <option value="Computer Science">Computer Science</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Electronics">Electronics</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Semester</label>
                <select value={newFolderSemester} onChange={(e) => setNewFolderSemester(e.target.value)} className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl">
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="All Semesters">All Semesters</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Note Content *</label>
                <textarea
                  value={htmlNoteContent}
                  onChange={(e) => setHtmlNoteContent(e.target.value)}
                  placeholder="<h1>Title</h1><p>Notes explanation, formulas, tables...</p>"
                  rows={10}
                  required
                  className="w-full px-3.5 py-2 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateHtmlModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                >
                  Save & Publish Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RENAME ITEM */}
      {/* ========================================================================= */}
      {renameItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Rename Item</h3>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 block mb-1">New Name</label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {(renameItem?.type === 'youtube' || renameItem?.type === 'link') && (
                <div>
                  <label className="text-xs text-slate-600 block mb-1">URL</label>
                  <input
                    type="url"
                    value={renameUrlValue}
                    onChange={(e) => setRenameUrlValue(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRenameItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500"
                >
                  Save Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: MOVE ITEM (Interactive folder selector) */}
      {/* ========================================================================= */}
      {moveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Move “{moveItem.name}”</h3>
            <p className="text-xs text-slate-500">Select destination folder in the Polytechnic Library:</p>

            <form onSubmit={handleMoveSubmit} className="space-y-4">
              <select
                value={selectedDestinationFolder || ''}
                onChange={(e) => setSelectedDestinationFolder(e.target.value || null)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Root (Library Top Level)</option>
                {allFolders
                  .filter(f => f.id !== moveItem.id) // cannot move into itself
                  .map(f => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name} {f.branch ? `(${f.branch})` : ''}
                    </option>
                  ))}
              </select>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMoveItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500"
                >
                  Move Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteItemConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Confirm Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{deleteItemConfirm.name}"</strong>?
              {deleteItemConfirm.type === 'folder' && (
                <span className="block mt-1 text-rose-600 font-semibold">
                  Warning: All nested subfolders and files inside this folder will also be permanently deleted.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteItemConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 shadow-md"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
