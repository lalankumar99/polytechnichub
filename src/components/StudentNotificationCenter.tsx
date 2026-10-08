import React, { useState, useEffect, useRef } from 'react';
import { PremiumCourse } from '../types';
import { 
  Bell, 
  Radio, 
  Clock, 
  X, 
  CheckCircle, 
  ExternalLink, 
  Volume2, 
  Sparkles, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { 
  requestNotificationPermission, 
  getNotificationPermission, 
  sendBrowserNotification, 
  playNotificationChime 
} from '../utils/notificationService';

interface StudentNotificationCenterProps {
  courses: PremiumCourse[];
  onOpenCourse: (course: PremiumCourse) => void;
  user?: any;
}

export const StudentNotificationCenter: React.FC<StudentNotificationCenterProps> = ({
  courses,
  onOpenCourse,
  user
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const liveCourses = courses.filter(c => c.isLive && c.liveYoutubeUrl);
  const scheduledCourses = courses.filter(c => !c.isLive && c.liveScheduledTime);

  const totalAlertCount = liveCourses.length + scheduledCourses.length;

  const handleEnableAlerts = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      playNotificationChime();
      sendBrowserNotification('🔔 Live Alerts Enabled!', {
        body: 'You will now receive instant device alerts whenever a live class starts.'
      });
    }
  };

  const handleTestAlert = () => {
    playNotificationChime();
    sendBrowserNotification('🔴 Live Class Test Alert', {
      body: 'Polytechnic Hub: Notifications and audio chimes are working perfectly!'
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="relative font-sans" ref={popoverRef}>
      
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`relative p-2 rounded-xl transition-all cursor-pointer ${
          liveCourses.length > 0 
            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
        }`}
        title="Student Notifications & Live Alerts"
      >
        <Bell className={`w-5 h-5 ${liveCourses.length > 0 ? 'text-red-600 animate-wiggle' : ''}`} />

        {/* Pulsing indicator or Badge Count */}
        {liveCourses.length > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[9px] font-black text-white items-center justify-center">
              {liveCourses.length}
            </span>
          </span>
        ) : totalAlertCount > 0 ? (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[9px] font-bold">
            {totalAlertCount}
          </span>
        ) : null}
      </button>

      {/* Popover Drawer */}
      {isOpen && (
        <div className="fixed inset-x-2 sm:inset-auto sm:right-0 sm:absolute top-14 sm:top-auto sm:mt-2 sm:w-96 max-w-[calc(100vw-16px)] mx-auto sm:mx-0 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in text-slate-900">
          
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <h3 className="font-extrabold text-sm">Class Notifications</h3>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer text-lg leading-none"
            >
              &times;
            </button>
          </div>

          <div className="max-h-[75vh] overflow-y-auto divide-y divide-slate-100">
            
            {/* 1. Device Push Notification Permission Card */}
            {permission !== 'granted' ? (
              <div className="p-3.5 bg-indigo-50/70 border-b border-indigo-100 space-y-2">
                <div className="flex items-start space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-indigo-950">Enable Device Live Alerts</p>
                    <p className="text-indigo-800/80 text-[11px] mt-0.5 leading-relaxed">
                      Get instant popup notifications on your phone or PC as soon as your teacher goes live.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEnableAlerts}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Turn On Device Notifications</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Device Push Alerts Active</span>
                </span>
                
                <button
                  onClick={handleTestAlert}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center space-x-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-indigo-200"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{testSent ? 'Sound Played!' : 'Test Sound'}</span>
                </button>
              </div>
            )}

            {/* 2. Active Live Classes */}
            {liveCourses.length > 0 && (
              <div className="p-3.5 space-y-2.5 bg-red-50/30">
                <div className="flex items-center space-x-2 text-xs font-black text-red-600 uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Active Live Classes ({liveCourses.length})</span>
                </div>

                <div className="space-y-2">
                  {liveCourses.map(course => (
                    <div 
                      key={course.id}
                      className="p-3 rounded-2xl bg-white border border-red-200 shadow-xs flex flex-col justify-between space-y-2"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.2 rounded border border-red-200">
                            Streaming Now
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {course.branch}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900 mt-1 leading-snug">
                          {course.name}
                        </h4>
                        {course.liveTopic && (
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium line-clamp-1">
                            Topic: {course.liveTopic}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          onOpenCourse(course);
                          setIsOpen(false);
                        }}
                        className="w-full py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <span>Join Live Stream Now 🔴</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Upcoming Scheduled Sessions */}
            {scheduledCourses.length > 0 && (
              <div className="p-3.5 space-y-2 bg-slate-50/50">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Upcoming Live Sessions ({scheduledCourses.length})</span>
                </div>

                <div className="space-y-2">
                  {scheduledCourses.map(course => (
                    <div
                      key={course.id}
                      onClick={() => {
                        onOpenCourse(course);
                        setIsOpen(false);
                      }}
                      className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-between text-xs group"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {course.name}
                        </p>
                        <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                          🕒 {course.liveScheduledTime}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Empty State */}
            {liveCourses.length === 0 && scheduledCourses.length === 0 && (
              <div className="p-8 text-center space-y-2 text-slate-500 text-xs">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700">No New Alerts Right Now</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  When your faculty starts a live stream or schedules a masterclass, you will receive notifications here and on your device.
                </p>
              </div>
            )}

          </div>

          {/* Footer with Manual Test */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Polytechnic Alerts System</span>
            <button
              onClick={handleTestAlert}
              className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
            >
              Test Notification
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
