import React, { useState, useEffect, useCallback } from 'react';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Signal, 
  BookOpen, 
  Info,
  ChevronRight
} from 'lucide-react';

interface OfflineIndicatorProps {
  onRetryConnection?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onRetryConnection }) => {
  const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);
  const [showModal, setShowModal] = useState<boolean>(() => !navigator.onLine);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [showOnlineToast, setShowOnlineToast] = useState<boolean>(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Ping test function to verify actual internet reachability
  const checkRealConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    setCheckError(null);
    try {
      // Fetch with timeout and cache buster
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`/api/public/stats?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && (res.ok || res.status < 500)) {
        setIsOffline(false);
        setShowModal(false);
        setShowOnlineToast(true);
        setTimeout(() => setShowOnlineToast(false), 3500);
        if (onRetryConnection) onRetryConnection();
        return true;
      } else {
        // Fallback to checking navigator if server HEAD fails
        if (navigator.onLine) {
          // May be server unreachable or DNS issue
          setCheckError('Server ping failed. Please check your internet connection.');
        } else {
          setCheckError('No active network connection detected.');
        }
        setIsOffline(true);
        return false;
      }
    } catch (e) {
      setCheckError('Network connection test timed out.');
      setIsOffline(true);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [onRetryConnection]);

  useEffect(() => {
    const handleOnline = () => {
      // Re-verify with ping
      checkRealConnection().then(isReachable => {
        if (isReachable) {
          setIsOffline(false);
          setShowModal(false);
          setShowOnlineToast(true);
          setTimeout(() => setShowOnlineToast(false), 3500);
        }
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowModal(true);
      setCheckError(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount
    if (!navigator.onLine) {
      setIsOffline(true);
      setShowModal(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkRealConnection]);

  return (
    <>
      {/* ---------------- 1. BACK ONLINE TOAST ---------------- */}
      {showOnlineToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in pointer-events-auto">
          <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-bold border border-emerald-500/50 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>Connection Restored — You are back online!</span>
            <button 
              onClick={() => setShowOnlineToast(false)}
              className="text-emerald-200 hover:text-white p-0.5 rounded cursor-pointer ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------- 2. PERSISTENT TOP OFFLINE BAR (WHEN MODAL IS CLOSED) ---------------- */}
      {isOffline && !showModal && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9998] animate-fade-in max-w-md w-[92%] sm:w-auto">
          <div className="bg-amber-600 text-white px-3.5 py-2 rounded-2xl shadow-lg flex items-center justify-between space-x-3 text-xs font-bold border border-amber-500">
            <div 
              onClick={() => setShowModal(true)} 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <WifiOff className="w-4 h-4 text-amber-200 shrink-0 animate-pulse" />
              <span>Offline Mode — No Internet</span>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={() => checkRealConnection()}
                disabled={isChecking}
                className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-extrabold flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Checking...' : 'Retry'}</span>
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="px-2 py-1 rounded-xl bg-amber-700/60 hover:bg-amber-700 text-amber-100 text-[11px] font-bold cursor-pointer"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 3. FULL OFFLINE POPUP MODAL ---------------- */}
      {isOffline && showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-600 to-amber-600 p-6 text-white text-center relative overflow-hidden">
              {/* Background decorative circles */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

              {/* Close icon */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
                title="Dismiss and continue offline"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Animated Icon */}
              <div className="relative inline-flex items-center justify-center mb-3">
                <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
                  <WifiOff className="w-8 h-8 text-white animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400"></span>
                </span>
              </div>

              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider text-amber-200 mb-1 border border-white/20">
                Network Disconnected
              </span>
              <h3 className="text-xl font-black text-white tracking-tight">
                You Are Currently Offline
              </h3>
              <p className="text-xs text-white/90 mt-1 max-w-xs mx-auto leading-relaxed">
                It looks like your device has lost internet connectivity.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {/* Status Diagnostic Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <span className="text-slate-600 font-bold flex items-center space-x-1.5">
                    <Signal className="w-3.5 h-3.5 text-slate-400" />
                    <span>Internet Connection:</span>
                  </span>
                  <span className="font-extrabold text-rose-600 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>Disconnected</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-bold flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Offline Study Access:</span>
                  </span>
                  <span className="font-extrabold text-emerald-600 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Cached Content Available</span>
                  </span>
                </div>
              </div>

              {/* Helpful Tips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                  Quick Troubleshooting Tips:
                </span>
                <ul className="text-xs text-slate-600 space-y-1.5 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70">
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Check if your <strong>Wi-Fi</strong> or <strong>Mobile Data</strong> is enabled.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Ensure <strong>Airplane Mode</strong> is switched off.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Previously opened notes and syllabi remain accessible offline.</span>
                  </li>
                </ul>
              </div>

              {/* Error message if retry failed */}
              {checkError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{checkError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => checkRealConnection()}
                  disabled={isChecking}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Checking Internet Connection...' : 'Check Connection / Retry'}</span>
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Continue Reading Offline
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;
