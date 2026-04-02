import { useState } from 'react';

/**
 * DisconnectButton — Prominent disconnect action with confirmation animation.
 * Only renders when a sensor is connected.
 */
function DisconnectButton({ isConnected, apiBase, onDisconnect }) {
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isConnected) return null;

  const handleDisconnect = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
      return;
    }

    setDisconnecting(true);
    try {
      const res = await fetch(`${apiBase}/sensor/disconnect`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'disconnected') {
        onDisconnect(data.message);
      }
    } catch (err) {
      console.error('Disconnect failed:', err);
    } finally {
      setDisconnecting(false);
      setShowConfirm(false);
    }
  };

  return (
    <button
      className={`disconnect-btn ${showConfirm ? 'disconnect-btn--confirm' : ''} ${disconnecting ? 'disconnect-btn--loading' : ''}`}
      onClick={handleDisconnect}
      disabled={disconnecting}
      title={showConfirm ? 'Click again to confirm disconnect' : 'Disconnect sensor'}
    >
      {disconnecting ? (
        <span className="disconnect-btn-spinner" />
      ) : (
        <span className="disconnect-btn-icon">⏻</span>
      )}
      <span className="disconnect-btn-text">
        {disconnecting ? 'Disconnecting...' : showConfirm ? 'Confirm Disconnect?' : 'Disconnect'}
      </span>
    </button>
  );
}

export default DisconnectButton;
