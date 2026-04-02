/**
 * SensorCard — Reusable glassmorphic card wrapper for sensor displays.
 * Provides consistent styling, optional status indicator, and hover animations.
 */

function SensorCard({ icon, title, status = null, children, className = '', style = {} }) {
  return (
    <div className={`sensor-card ${className}`} style={style}>
      <div className="sensor-card-header">
        <div className="sensor-card-icon-wrap">
          <span className="sensor-card-icon">{icon}</span>
          {status && (
            <span className={`sensor-card-status sensor-card-status--${status}`} 
                  title={status === 'online' ? 'Sensor Online' : 'Sensor Offline'} />
          )}
        </div>
        <h2 className="sensor-card-title">{title}</h2>
      </div>
      <div className="sensor-card-body">
        {children}
      </div>
    </div>
  );
}

export default SensorCard;
