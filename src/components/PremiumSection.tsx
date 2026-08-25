import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PremiumCourse } from '../types';
import { Shield, Lock, CreditCard, ChevronRight } from 'lucide-react';

interface PremiumSectionProps {
  onOpenCourse: (course: PremiumCourse) => void;
}

export const PremiumSection: React.FC<PremiumSectionProps> = ({ onOpenCourse }) => {
  const [courses, setCourses] = useState<PremiumCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPremiumCourses().then(res => {
      setCourses(res.filter((c: any) => c.status === 'published'));
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (courses.length === 0) return null;

  return (
    <div className="py-12 bg-slate-900 text-white mt-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-500/10 opacity-50" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="w-8 h-8 text-amber-400" />
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-rose-400">
            Premium Courses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div 
              key={course.id} 
              onClick={() => onOpenCourse(course)}
              className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer transition-all group"
            >
              {course.bannerUrl ? (
                <img src={course.bannerUrl} alt={course.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-slate-600" />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {course.branch}
                  </span>
                  <span className="text-xl font-black text-white">
                    ₹{course.price}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">{course.name}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                  {course.description}
                </p>
                <div className="flex items-center text-sm font-semibold text-cyan-400 group-hover:text-amber-400 transition-colors">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
