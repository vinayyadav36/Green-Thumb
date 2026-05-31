import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function UpdateBanner() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({});

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="update-banner" style={{ background: '#fef3c7', color: '#92400e', padding: '1rem', textAlign: 'center', borderBottom: '1px solid #f59e0b' }}>
      <div className="update-banner-message">
        {offlineReady
          ? <span>App ready to work offline</span>
          : <span>Update available — refresh</span>}
      </div>
      <div className="update-banner-buttons" style={{ marginTop: '0.5rem' }}>
        {needRefresh && (
          <button onClick={() => updateServiceWorker(true)} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', background: '#d97706', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Reload
          </button>
        )}
        <button onClick={() => close()} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#92400e', border: '1px solid #92400e', borderRadius: '4px', cursor: 'pointer' }}>
          Close
        </button>
      </div>
    </div>
  );
}

export default UpdateBanner;
