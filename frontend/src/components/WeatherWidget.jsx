import SensorCard from './SensorCard';
import { safe, hasValue, getWeatherState, getRainfallLabel, getRainfallColor } from '../utils/sensorHelpers';

/**
 * WeatherWidget — Displays environmental sensor readings with dynamic weather icons.
 * Shows: Temperature, Humidity, Rainfall, Soil probe temperature.
 * All values use safe() for NA fallback.
 */
function WeatherWidget({ sensorRaw, isConnected }) {
  const dht = sensorRaw?.dht22 || null;
  const rain = sensorRaw?.rain || null;
  const soilProbe = sensorRaw?.ds18b20 || null;
  const weather = getWeatherState(rain, dht);

  return (
    <SensorCard 
      icon={<span className={`weather-icon-animated ${weather.animClass}`}>{weather.icon}</span>}
      title="Weather & Environment"
      status={isConnected ? 'online' : 'offline'}
      className="weather-widget"
    >
      {/* Main weather hero */}
      <div className="weather-hero">
        <div className={`weather-hero-icon ${weather.animClass}`}>
          {weather.icon}
        </div>
        <div className="weather-hero-info">
          <span className="weather-hero-temp">
            {hasValue(dht?.temp_c) ? `${dht.temp_c}°C` : 'NA'}
          </span>
          <span className="weather-hero-label">{weather.label}</span>
        </div>
      </div>

      {/* Environmental readings grid */}
      <div className="weather-readings">
        <div className="weather-reading-item">
          <span className="weather-reading-icon">🌡️</span>
          <div className="weather-reading-data">
            <span className="weather-reading-value">
              {hasValue(dht?.temp_c) ? `${dht.temp_c}°C` : <span className="na-value">NA</span>}
            </span>
            <span className="weather-reading-label">Ambient Temp</span>
          </div>
        </div>

        <div className="weather-reading-item">
          <span className="weather-reading-icon">💧</span>
          <div className="weather-reading-data">
            <span className="weather-reading-value">
              {hasValue(dht?.humidity) ? `${dht.humidity}%` : <span className="na-value">NA</span>}
            </span>
            <span className="weather-reading-label">Humidity</span>
          </div>
        </div>

        <div className="weather-reading-item">
          <span className="weather-reading-icon">🌱</span>
          <div className="weather-reading-data">
            <span className="weather-reading-value">
              {hasValue(soilProbe?.temp_c) ? `${soilProbe.temp_c}°C` : <span className="na-value">NA</span>}
            </span>
            <span className="weather-reading-label">Soil Probe</span>
          </div>
        </div>

        <div className="weather-reading-item">
          <span className="weather-reading-icon">🌧️</span>
          <div className="weather-reading-data">
            <span className="weather-reading-value">
              {hasValue(rain?.raw) ? rain.raw : <span className="na-value">NA</span>}
            </span>
            <span className="weather-reading-label">Rain Signal</span>
          </div>
        </div>
      </div>

      {/* Rainfall banner */}
      {rain && (
        <div className="rainfall-banner">
          <span 
            className="rainfall-badge" 
            style={{ backgroundColor: getRainfallColor(rain.intensity) }}
          >
            {getRainfallLabel(rain.intensity)}
          </span>
          <div className="rainfall-meta">
            <span className="rainfall-intensity">
              {rain.intensity?.toUpperCase() || 'UNKNOWN'} INTENSITY
            </span>
            <span className="rainfall-signal">Signal: {safe(rain.raw)}</span>
          </div>
        </div>
      )}
    </SensorCard>
  );
}

export default WeatherWidget;
