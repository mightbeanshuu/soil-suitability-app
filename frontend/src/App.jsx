import { useEffect, useState, useRef } from 'react';
import './index.css';

const API_HTTP = "http://localhost:8000";
const API_WS = "ws://localhost:8000/ws";

function App() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const wsRef = useRef(null);

  useEffect(() => {
    // Fetch crops on mount
    fetch(`${API_HTTP}/crops`)
      .then(res => res.json())
      .then(res => {
        if (res.crops && res.crops.length > 0) {
          setCrops(res.crops);
          setSelectedCrop(res.crops[0]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch crops", err);
        // Do not crash fully, just let it load indefinitely or display a silent error
        setError("Could not connect to backend API.");
      });
  }, []);

  useEffect(() => {
    if (!selectedCrop) return;

    const connectWS = () => {
      if (wsRef.current) wsRef.current.close();
      
      const ws = new WebSocket(`${API_WS}/${selectedCrop}`);
      
      ws.onopen = () => {
        setError(null);
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.error) {
          setError(payload.error);
        } else {
          setData(payload);
          setError(null);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      };

      ws.onerror = () => {
        // Handled via onclose reconnect
      };

      ws.onclose = () => {
        // Try to reconnect in 2s
        setTimeout(connectWS, 2000);
      };

      wsRef.current = ws;
    };

    connectWS();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [selectedCrop]);

  const handleCropChange = (e) => {
    setSelectedCrop(e.target.value);
    setData(null);
  };

  return (
    <>
      <header className="app-header">
        <div className="live-dot" title="Live WebSocket Connection Active"></div>
        <h1 className="app-title">SoilSense</h1>
        <span className="app-subtitle">Real-Time Soil Suitability</span>
      </header>

      <main className="main-content">
        <div className="controls">
          <label htmlFor="cropSelect">Target Crop Profile:</label>
          <select 
            id="cropSelect" 
            value={selectedCrop} 
            onChange={handleCropChange}
            disabled={crops.length === 0}
          >
            {crops.length === 0 && <option>Waiting for backend data...</option>}
            {crops.map(crop => (
              <option key={crop} value={crop}>
                {crop.charAt(0).toUpperCase() + crop.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="card" style={{ borderColor: 'var(--danger)', textAlign: 'center' }}>
            <h2>❌ Connection Issue</h2>
            <p>{error}</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
              Make sure the FastAPI backend is running on http://localhost:8000
            </p>
          </div>
        ) : !data ? (
          <div className="spinner"></div>
        ) : (
          <div className="dashboard-grid">
            
            {/* Sensor Readings Card */}
            <div className="card">
               <h2>📡 Live Sensor Readings</h2>
               {['N', 'P', 'K', 'pH'].map(param => (
                 <div className="data-row" key={param}>
                    <span className="data-label">
                      {param === 'pH' ? 'pH Level' : `${param} (mg/kg)`}
                    </span>
                    <div className="data-value">
                      {data.params[param]?.value}
                      <span className={`badge status-${data.params[param]?.status}`}>
                        {data.params[param]?.status}
                      </span>
                    </div>
                 </div>
               ))}
               <div className="data-row" style={{ marginTop: '0.8rem', border: 'none' }}>
                 <span className="data-label" style={{ fontSize: '0.85rem' }}>Raw Soil Data Interface via Arduino Serial Port</span>
               </div>
            </div>

            {/* Requirements Card */}
            <div className="card">
              <h2>🌿 {data.crop.charAt(0).toUpperCase() + data.crop.slice(1)} Requirements</h2>
              {['N', 'P', 'K', 'pH'].map(param => {
                 const req = data.params[param];
                 if (!req) return null;
                 return (
                   <div className="data-row" key={'req'+param}>
                     <span className="data-label">{param === "pH" ? "pH" : param} Range</span>
                     <div className="data-value">
                       <span>{req.required_min} &ndash; {req.required_max}</span>
                       <span className="data-sub-value">(avg {req.required_mean})</span>
                     </div>
                   </div>
                 );
              })}
              <div className="data-row" style={{ marginTop: '0.8rem', border: 'none' }}>
                 <span className="data-label" style={{ fontSize: '0.85rem' }}>Target profile based on AI Model Dataset</span>
               </div>
            </div>

            {/* Verdict Card */}
            <div className={`card verdict-card ${data.suitable ? 'suitable' : 'unsuitable'}`}>
              <div className="verdict-title">{data.verdict}</div>
              
              <div className="verdict-details">
                {!data.suitable ? (
                  <>
                    {data.issues.length > 0 && (
                      <div className="detail-section">
                        <h3 className="section-title serif">Issues Detected</h3>
                        <ul className="list-items issues">
                          {data.issues.map((i, idx) => <li key={idx}>{i}</li>)}
                        </ul>
                      </div>
                    )}
                    {data.suggestions.length > 0 && (
                      <div className="detail-section">
                        <h3 className="section-title serif">Organic Treatments</h3>
                        <ul className="list-items suggestions">
                          {data.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="detail-section" style={{ gridColumn: '1 / -1', background: 'transparent', border: 'none' }}>
                    <p className="success-message">
                      Soil conditions are within optimal range for <strong>{data.crop}</strong>. 
                      Proceed with planting!
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {lastUpdated && (
          <div className="footer-info">
            Live Field Data Feed &bull; Last updated at {lastUpdated}
          </div>
        )}
      </main>
    </>
  );
}

export default App;
