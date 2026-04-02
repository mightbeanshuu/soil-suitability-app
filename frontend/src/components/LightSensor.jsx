import SensorCard from './SensorCard';
import { safe, hasValue, getLightState } from '../utils/sensorHelpers';

/**
 * LightSensor — Dedicated card for Light (Lux) readings.
 * Features a dynamic lightbulb icon whose opacity scales with brightness,
 * and a gradient bar visualizing the light level.
 */
function LightSensor({ sensorRaw, isConnected }) {
  const lux = sensorRaw?.light_lux ?? null;
  const light = getLightState(lux);

  // Gradient bar percentage (cap at 100k lux = direct sunlight)
  const barPercent = hasValue(lux) ? Math.min((lux / 100000) * 100, 100) : 0;

  return (
    <SensorCard
      icon="💡"
      title="Light Sensor"
      status={isConnected ? 'online' : 'offline'}
      className="light-sensor-card"
    >
      <div className="light-sensor-display">
        <div className="light-sensor-icon-wrap">
          <span 
            className="light-sensor-bulb" 
            style={{ opacity: light.opacity }}
            title={light.label}
          >
            💡
          </span>
          {hasValue(lux) && (
            <span className="light-sensor-glow" style={{ opacity: light.opacity * 0.6 }} />
          )}
        </div>

        <div className="light-sensor-value-wrap">
          <span className={`light-sensor-value ${!hasValue(lux) ? 'na-value' : ''}`}>
            {hasValue(lux) ? lux.toLocaleString() : 'NA'}
          </span>
          {hasValue(lux) && <span className="light-sensor-unit">lux</span>}
        </div>

        <span className={`light-sensor-level light-sensor-level--${light.level}`}>
          {light.label}
        </span>
      </div>

      {/* Brightness gradient bar */}
      <div className="light-bar-container">
        <div className="light-bar-track">
          <div 
            className="light-bar-fill" 
            style={{ width: `${barPercent}%` }}
          />
          {hasValue(lux) && (
            <div className="light-bar-indicator" style={{ left: `${barPercent}%` }} />
          )}
        </div>
        <div className="light-bar-labels">
          <span>Dark</span>
          <span>Dim</span>
          <span>Indoor</span>
          <span>Bright</span>
          <span>Sunlight</span>
        </div>
      </div>
    </SensorCard>
  );
}

export default LightSensor;
