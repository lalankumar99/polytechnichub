const fs = require('fs');

const hookCode = `import { useState, useEffect } from 'react';

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
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && !!(window.navigator as any).standalone;
    
    // Check standard matchMedia for PWA
    const isStandardStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isInStandaloneMode && !isStandardStandalone) {
      setIsIOS(true);
      setIsInstallable(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (isStandardStandalone) {
      setIsInstallable(false);
    }

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
    } else if (isIOS) {
      alert("To install this app on your iPhone or iPad:\\n\\n1. Tap the Share button (square with an up arrow)\\n2. Scroll down and tap 'Add to Home Screen'");
    } else {
      alert("To install this app:\\n\\nTap the menu in your browser and select 'Add to Home Screen' or 'Install App'.");
    }
  };

  return { isInstallable, promptInstall };
}
`;

fs.writeFileSync('src/hooks/usePWAInstall.ts', hookCode);
console.log('usePWAInstall updated for iOS compatibility');
