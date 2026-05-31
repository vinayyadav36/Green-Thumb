import React, { useState, useEffect } from 'react';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="install-prompt-banner" style={{ background: '#166534', color: 'white', padding: '1rem', textAlign: 'center' }}>
      <span>Install our app for a better experience!</span>
      <button onClick={handleInstallClick} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', background: 'white', color: '#166534', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Add to Home Screen
      </button>
      <button onClick={() => setIsVisible(false)} style={{ marginLeft: '0.5rem', padding: '0.5rem', background: 'transparent', color: 'white', border: '1px solid white', borderRadius: '4px', cursor: 'pointer' }}>
        Dismiss
      </button>
    </div>
  );
}

export default InstallPrompt;
