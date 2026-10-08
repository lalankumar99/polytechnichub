/**
 * Student Notification Service
 * Handles Browser Push/Web Notifications, Web Audio chimes, and alert tracking
 */

// Play melodic 2-tone chime using native Web Audio API (No external sound files required)
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // First tone (C5 - 523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Second tone (E5 - 659.25 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // AudioContext may require prior user interaction
  }
}

// Request permission for Web Notifications
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    return 'denied';
  }
}

// Check current notification permission
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// Trigger device / browser notification
export async function sendBrowserNotification(
  title: string, 
  options?: { body?: string; icon?: string; tag?: string; data?: any }
): Promise<boolean> {
  if (!('Notification' in window)) return false;

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    // If ServiceWorker registration is available, prefer registration.showNotification
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body: options?.body || 'Tap to open and join your class',
          icon: options?.icon || '/icon-192.png',
          badge: '/favicon.png',
          tag: options?.tag || 'polytechnic-hub-alert',
          renotify: true,
          data: options?.data || {}
        } as any);
        return true;
      }
    }

    // Fallback to standard window Notification
    const notif = new Notification(title, {
      body: options?.body || 'Tap to open and join your class',
      icon: options?.icon || '/icon-192.png',
      tag: options?.tag || 'polytechnic-hub-alert'
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return true;
  } catch (e) {
    console.error('Error dispatching browser notification:', e);
    return false;
  }
}

// Key for tracking which live streams have already notified this session
const NOTIFIED_CACHE_KEY = 'polytechnic_notified_live_streams';

export function hasNotifiedForLiveStream(courseId: string, timestamp?: string): boolean {
  try {
    const raw = sessionStorage.getItem(NOTIFIED_CACHE_KEY);
    if (!raw) return false;
    const cache: Record<string, string> = JSON.parse(raw);
    return Boolean(cache[courseId]);
  } catch {
    return false;
  }
}

export function markLiveStreamAsNotified(courseId: string, timestamp?: string): void {
  try {
    const raw = sessionStorage.getItem(NOTIFIED_CACHE_KEY);
    const cache: Record<string, string> = raw ? JSON.parse(raw) : {};
    cache[courseId] = timestamp || new Date().toISOString();
    sessionStorage.setItem(NOTIFIED_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export function clearLiveStreamNotificationState(courseId: string): void {
  try {
    const raw = sessionStorage.getItem(NOTIFIED_CACHE_KEY);
    if (!raw) return;
    const cache: Record<string, string> = JSON.parse(raw);
    delete cache[courseId];
    sessionStorage.setItem(NOTIFIED_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}
