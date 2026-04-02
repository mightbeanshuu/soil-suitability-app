import * as XLSX from 'xlsx';

/**
 * Flatten a single sensor data tick into a row object for Excel export.
 * Produces one row per timestamp with all sensor readings as columns.
 * Missing/null values are recorded as "NA" with status "NA".
 */
export function flattenSensorReading(sensorRaw, sessionId, sessionName) {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

  const safeVal = (v) => (v !== null && v !== undefined && !Number.isNaN(v)) ? v : 'NA';
  const status = (v) => (v !== null && v !== undefined && !Number.isNaN(v)) ? 'Valid' : 'NA';

  return {
    'Session ID': `${sessionName}-${String(sessionId).padStart(3, '0')}`,
    'Timestamp': timestamp,
    'N (mg/kg)': safeVal(sensorRaw?.N),
    'N Status': status(sensorRaw?.N),
    'P (mg/kg)': safeVal(sensorRaw?.P),
    'P Status': status(sensorRaw?.P),
    'K (mg/kg)': safeVal(sensorRaw?.K),
    'K Status': status(sensorRaw?.K),
    'pH': safeVal(sensorRaw?.pH),
    'pH Status': status(sensorRaw?.pH),
    'Moisture (%)': safeVal(sensorRaw?.moisture),
    'Moisture Status': status(sensorRaw?.moisture),
    'Light (lux)': safeVal(sensorRaw?.light_lux),
    'Light Status': status(sensorRaw?.light_lux),
    'Pressure (hPa)': safeVal(sensorRaw?.pressure_hpa),
    'Pressure Status': status(sensorRaw?.pressure_hpa),
    'Ambient Temp (°C)': safeVal(sensorRaw?.dht22?.temp_c),
    'Temp Status': status(sensorRaw?.dht22?.temp_c),
    'Humidity (%)': safeVal(sensorRaw?.dht22?.humidity),
    'Humidity Status': status(sensorRaw?.dht22?.humidity),
    'Soil Probe (°C)': safeVal(sensorRaw?.ds18b20?.temp_c),
    'Soil Probe Status': status(sensorRaw?.ds18b20?.temp_c),
    'Rain Intensity': safeVal(sensorRaw?.rain?.intensity),
    'Rain Signal': safeVal(sensorRaw?.rain?.raw),
    'Rain Status': status(sensorRaw?.rain?.intensity),
  };
}

/**
 * Export recorded data array to a beautifully formatted .xlsx file.
 * Uses dynamic naming: [testName]_[date]_[sessionTime].xlsx
 * 
 * @param {Array} recordedData - Array of flattened row objects
 * @param {string} testName - User-defined test name
 * @param {Date} sessionStart - When recording started
 * @returns {{ success: boolean, filename?: string, error?: string }}
 */
export function exportToExcel(recordedData, testName, sessionStart) {
  try {
    if (!recordedData || recordedData.length === 0) {
      return { success: false, error: 'No recorded data to export.' };
    }

    // Dynamic filename: test1_2026-04-02_18-42.xlsx
    const now = sessionStart || new Date();
    const dateStr = now.toISOString().substring(0, 10); // 2026-04-02
    const timeStr = now.toTimeString().substring(0, 5).replace(':', '-'); // 18-42
    const safeName = (testName || 'test').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeName}_${dateStr}_${timeStr}.xlsx`;

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(recordedData);

    // Column widths for readability
    const colWidths = [
      { wch: 14 }, // Session ID
      { wch: 20 }, // Timestamp
      { wch: 12 }, // N
      { wch: 8 },  // N Status
      { wch: 12 }, // P
      { wch: 8 },  // P Status
      { wch: 12 }, // K
      { wch: 8 },  // K Status
      { wch: 8 },  // pH
      { wch: 8 },  // pH Status
      { wch: 12 }, // Moisture
      { wch: 10 }, // Moisture Status
      { wch: 12 }, // Light
      { wch: 10 }, // Light Status
      { wch: 14 }, // Pressure
      { wch: 12 }, // Pressure Status
      { wch: 16 }, // Ambient Temp
      { wch: 10 }, // Temp Status
      { wch: 12 }, // Humidity
      { wch: 12 }, // Humidity Status
      { wch: 14 }, // Soil Probe
      { wch: 12 }, // Soil Probe Status
      { wch: 14 }, // Rain Intensity
      { wch: 12 }, // Rain Signal
      { wch: 10 }, // Rain Status
    ];
    ws['!cols'] = colWidths;

    // Add summary sheet
    const summaryData = [
      { 'Property': 'Test Name', 'Value': testName },
      { 'Property': 'Export Date', 'Value': new Date().toISOString().replace('T', ' ').substring(0, 19) },
      { 'Property': 'Session Start', 'Value': now.toISOString().replace('T', ' ').substring(0, 19) },
      { 'Property': 'Total Readings', 'Value': recordedData.length },
      { 'Property': 'Duration', 'Value': `${Math.round((Date.now() - now.getTime()) / 1000)}s` },
      { 'Property': 'Unique Sessions', 'Value': [...new Set(recordedData.map(r => r['Session ID']))].length },
      { 'Property': 'Application', 'Value': 'SoilSense Dashboard' },
      { 'Property': 'Format Version', 'Value': '1.0' },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 18 }, { wch: 40 }];

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    XLSX.utils.book_append_sheet(wb, ws, 'Sensor Data');

    // Trigger browser download
    XLSX.writeFile(wb, filename);

    return { success: true, filename };
  } catch (err) {
    console.error('Excel export failed:', err);
    return { success: false, error: err.message || 'Export failed unexpectedly.' };
  }
}
