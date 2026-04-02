import SensorCard from './SensorCard';
import { hasValue, getPressureState } from '../utils/sensorHelpers';

/**
 * BarometricPressure — Dedicated card for barometric pressure (hPa) readings.
 * Features a gauge icon with subtle rotation tied to pressure range,
 * and a classification label (Low / Normal / High).
 */
function BarometricPressure({ sensorRaw, isConnected }) {
  const hPa = sensorRaw?.pressure_hpa ?? null;
  const pressure = getPressureState(hPa);

  // Map pressure to gauge rotation: 980hPa = -45deg, 1050hPa = 45deg
  const gaugeRotation = hasValue(hPa)
    ? ((hPa - 1015) / 35) * 45 // center at 1015, ±35 range → ±45°
    : 0;

  return (
    <SensorCard
      icon="🎛️"
      title="Barometric Pressure"
      status={isConnected ? 'online' : 'offline'}
      className="barometric-card"
    >
      <div className="barometric-display">
        <div className="barometric-gauge-wrap">
          <span 
            className="barometric-gauge-icon"
            style={{ transform: `rotate(${gaugeRotation}deg)` }}
          >
            🎛️
          </span>
          <svg className="barometric-arc" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M 10 65 A 50 50 0 0 1 110 65" 
              fill="none" 
              stroke="rgba(97, 187, 97, 0.15)" 
              strokeWidth="6"
              strokeLinecap="round"
            />
            {hasValue(hPa) && (
              <path 
                d="M 10 65 A 50 50 0 0 1 110 65" 
                fill="none" 
                stroke={pressure.level === 'low' ? '#eab34e' : pressure.level === 'high' ? '#d1493b' : '#61bb61'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="157"
                strokeDashoffset={157 - (157 * Math.min(Math.max((hPa - 980) / 70, 0), 1))}
                className="barometric-arc-fill"
              />
            )}
          </svg>
        </div>

        <div className="barometric-value-wrap">
          <span className={`barometric-value ${!hasValue(hPa) ? 'na-value' : ''}`}>
            {hasValue(hPa) ? hPa.toFixed(1) : 'NA'}
          </span>
          {hasValue(hPa) && <span className="barometric-unit">hPa</span>}
        </div>

        <span className={`barometric-level barometric-level--${pressure.level}`}>
          {pressure.label}
        </span>
      </div>

      {/* Pressure range context */}
      <div className="barometric-range">
        <div className="barometric-range-labels">
          <span className="barometric-range-low">Low (&lt;1000)</span>
          <span className="barometric-range-normal">Normal</span>
          <span className="barometric-range-high">High (&gt;1025)</span>
        </div>
      </div>
    </SensorCard>
  );
}

export default BarometricPressure;
