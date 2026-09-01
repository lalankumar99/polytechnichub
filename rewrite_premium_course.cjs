const fs = require('fs');

let code = fs.readFileSync('src/components/PremiumCourseView.tsx', 'utf-8');

// The file has a complex setup. We can just replace the whole file to make it cleaner.
const newCode = `
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PremiumCourse, PremiumItem } from '../types';
import { Shield, ChevronLeft, CheckCircle, AlertCircle, FileText, Folder, Youtube, Link2, Code } from 'lucide-react';

interface PremiumCourseViewProps {
  course: PremiumCourse;
  onBack: () => void;
  user: any; // premiumUser
  onOpenFile: (file: any) => void;
  onOpenPremiumLogin?: () => void;
}

export const PremiumCourseView: React.FC<PremiumCourseViewProps> = ({ course, onBack, user, onOpenFile, onOpenPremiumLogin }) => {
  const [items, setItems] = useState<PremiumItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user?.status === 'approved') {
        try {
          const courseItems = await api.getPremiumItems(course.id);
          setItems(courseItems.filter((i: any) => i.status === 'published'));
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [user, course.id]);

  const currentItems = items.filter(i => i.parentId === currentFolder);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-bold text-lg truncate">{course.name}</h1>
              {course.branch && <span className="text-xs text-slate-400">{course.branch}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : user?.status === 'approved' ? (
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
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <Folder className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No items in this folder yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => item.type === 'folder' ? setCurrentFolder(item.id) : onOpenFile(item)}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        {item.type === 'folder' ? <Folder className="w-6 h-6 text-amber-500" /> :
                         item.type === 'pdf' ? <FileText className="w-6 h-6 text-red-500" /> :
                         item.type === 'youtube' ? <Youtube className="w-6 h-6 text-red-600" /> :
                         item.type === 'link' ? <Link2 className="w-6 h-6 text-blue-500" /> :
                         <Code className="w-6 h-6 text-emerald-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate mb-1">{item.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{item.description || 'Premium material'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
              <Shield className="w-16 h-16 text-amber-500 mx-auto mb-6" />
              <h2 className="text-2xl font-black text-slate-900 mb-4">Premium Access Required</h2>
              <p className="text-slate-600 mb-8">
                {user ? "Your account is pending admin approval." : "You need to log in or register to access this premium course."}
              </p>
              {!user && onOpenPremiumLogin && (
                <button 
                  onClick={onOpenPremiumLogin}
                  className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg"
                >
                  Login / Register Premium
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/PremiumCourseView.tsx', newCode);
console.log('PremiumCourseView updated to use the unified premium user system.');
