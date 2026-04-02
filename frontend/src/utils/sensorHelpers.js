/**
 * Sensor data utility functions
 * Centralizes null-checking, icon resolution, and classification logic
 */

/**
 * Safely format a sensor value. Returns "NA" if null/undefined/NaN.
 * @param {*} value - The raw sensor reading
 * @param {string} [unit=''] - Optional unit suffix (e.g., '°C', '%', ' hPa')
 * @returns {string} Formatted value or "NA"
 */
export function safe(value, unit = '') {
  if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
    return 'NA';
  }
  return `${value}${unit}`;
}

/**
 * Returns true if the value is a valid, non-null reading
 */
export function hasValue(value) {
  return value !== null && value !== undefined && !(typeof value === 'number' && isNaN(value));
}

/**
 * Determine the appropriate weather icon based on rain and temperature data
 * @param {object|null} rainData - e.g. { raining: true, intensity: "heavy", raw: 795 }
 * @param {object|null} dhtData  - e.g. { temp_c: 29.3, humidity: 62.5 }
 * @returns {{ icon: string, label: string, animClass: string }}
 */
export function getWeatherState(rainData, dhtData) {
  const intensity = (rainData?.intensity || '').toLowerCase();
  const isRaining = rainData?.raining === true || 
    intensity.includes('heavy') || intensity.includes('mod') || intensity.includes('high');
  const temp = dhtData?.temp_c;
  const humidity = dhtData?.humidity;

  if (isRaining) {
    if (intensity.includes('heavy') || intensity.includes('high')) {
      return { icon: '🌧️', label: 'Heavy Rain', animClass: 'weather-heavy-rain' };
    }
    if (intensity.includes('mod')) {
      return { icon: '🌦️', label: 'Moderate Rain', animClass: 'weather-moderate-rain' };
    }
    return { icon: '🌥️', label: 'Light Rain', animClass: 'weather-light-rain' };
  }

  // Not raining — derive from temperature/humidity
  if (temp !== null && temp !== undefined) {
    if (temp > 35) return { icon: '☀️', label: 'Hot & Clear', animClass: 'weather-sunny' };
    if (temp > 25) return { icon: '⛅', label: 'Warm & Partly Cloudy', animClass: 'weather-partly' };
    if (humidity && humidity > 80) return { icon: '☁️', label: 'Overcast & Humid', animClass: 'weather-cloudy' };
    return { icon: '🌤️', label: 'Clear', animClass: 'weather-clear' };
  }

  return { icon: '🌡️', label: 'No Data', animClass: '' };
}

/**
 * Map rain intensity string to a prominent UI label
 */
export function getRainfallLabel(intensity) {
  if (!intensity) return 'NO RAIN';
  const i = intensity.toLowerCase();
  if (i.includes('light') || i.includes('low')) return 'LOW RAINFALL';
  if (i.includes('heavy') || i.includes('high')) return 'HIGH RAINFALL';
  if (i.includes('mod')) return 'MODERATE RAINFALL';
  return 'NO RAIN';
}

/**
 * Get rainfall badge color based on intensity
 */
export function getRainfallColor(intensity) {
  if (!intensity) return 'rgba(97, 187, 97, 0.8)';
  const i = intensity.toLowerCase();
  if (i.includes('heavy') || i.includes('high')) return '#d1493b';
  if (i.includes('mod')) return '#eab34e';
  return 'rgba(97, 187, 97, 0.8)';
}

/**
 * Classify barometric pressure reading
 * @param {number|null} hPa - Pressure in hectopascals
 * @returns {{ label: string, level: string }}
 */
export function getPressureState(hPa) {
  if (!hasValue(hPa)) return { label: 'No Data', level: 'na' };
  if (hPa < 1000) return { label: 'Low Pressure', level: 'low' };
  if (hPa > 1025) return { label: 'High Pressure', level: 'high' };
  return { label: 'Normal', level: 'normal' };
}

/**
 * Get light level classification and icon opacity
 * @param {number|null} lux - Light reading in lux
 * @returns {{ label: string, level: string, opacity: number }}
 */
export function getLightState(lux) {
  if (!hasValue(lux)) return { label: 'No Data', level: 'na', opacity: 0.3 };
  if (lux < 200) return { label: 'Dark', level: 'dark', opacity: 0.3 };
  if (lux < 1000) return { label: 'Dim', level: 'dim', opacity: 0.45 };
  if (lux < 10000) return { label: 'Indoor Light', level: 'indoor', opacity: 0.6 };
  if (lux < 50000) return { label: 'Bright', level: 'bright', opacity: 0.8 };
  return { label: 'Direct Sunlight', level: 'sunlight', opacity: 1.0 };
}
