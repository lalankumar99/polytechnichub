import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'desktop' | 'android' | 'other'>('other');

  useEffect(() => {
    // Detect device type for better instructions
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType('ios');
    } else if (/mac|windows|linux/.test(ua) && !/android/.test(ua)) {
      setDeviceType('desktop');
    } else if (/android/.test(ua)) {
      setDeviceType('android');
    }

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (!isStandalone) {
      // By default, if not installed, we can say it's installable (either native or manual)
      setIsInstallable(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setShowManualInstructions(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback for iOS, Safari, Firefox, Desktop unsupported, etc.
      setShowManualInstructions(true);
    }
  };

  const closeManualInstructions = () => {
    setShowManualInstructions(false);
  };

  return { isInstallable, promptInstall, showManualInstructions, closeManualInstructions, deviceType };
}
