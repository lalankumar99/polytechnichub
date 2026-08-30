import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PremiumCourse } from '../types';
import { Lock, PlayCircle, Sparkles, Image as ImageIcon } from 'lucide-react';

interface PremiumCoursesViewProps {
  onOpenLogin: () => void;
  premiumUser: any;
  onOpenCourse?: (courseId: string) => void;
}

export const PremiumCoursesView: React.FC<PremiumCoursesViewProps> = ({ onOpenLogin, premiumUser, onOpenCourse }) => {
  const [courses, setCourses] = useState<PremiumCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.getPremiumCourses();
        // Show only published courses to students
        setCourses((data || []).filter((c: PremiumCourse) => c.status === 'published'));
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Premium Learning</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Unlock Exclusive Courses
        </h1>
        <p className="text-slate-500">
          Enroll in our premium structured courses, designed specifically for polytechnic exams.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 font-medium">No premium courses available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-xl transition-all">
              {/* Banner Image */}
              <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                {course.bannerUrl ? (
                  <img src={course.bannerUrl} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-indigo-300" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="font-extrabold text-emerald-600">₹{course.price}</span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                {course.branch && (
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">{course.branch}</span>
                )}
                <h3 className="font-bold text-xl text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1">{course.description}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100">
                  {premiumUser ? (
                    <button 
                      onClick={() => onOpenCourse && onOpenCourse(course.id)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold flex justify-center items-center space-x-2 transition-colors shadow-md"
                    >
                      <PlayCircle className="w-5 h-5" />
                      <span>Access Course</span>
                    </button>
                  ) : (
                    <button 
                      onClick={onOpenLogin}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold flex justify-center items-center space-x-2 transition-colors shadow-md"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Enroll / Login to View</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
