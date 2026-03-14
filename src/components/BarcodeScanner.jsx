import { useState, useEffect, useRef, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { X, Camera, RefreshCw, ShoppingCart, CheckCircle2 } from 'lucide-react';

const styles = `
  .bar-modal {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(61, 106, 55, 0.15);
    backdrop-filter: blur(12px);
    padding: 1.5rem;
  }

  .bar-card {
    position: relative;
    width: 100%;
    max-width: 480px;
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid var(--primary-light);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 40px 80px -20px rgba(61, 106, 55, 0.2);
  }

  header.bar-header {
    text-align: center;
    padding: 2.5rem 2rem 1.5rem;
    background: #fcfdfc;
    position: relative;
    z-index: 1;
  }

  .bar-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--primary-color);
    letter-spacing: -0.02em;
    margin: 0;
  }

  .bar-title span { color: var(--primary-color); opacity: 0.6; }

  .bar-subtitle {
    margin-top: 0.5rem;
    font-size: 0.95rem;
    color: var(--text-muted);
    font-weight: 500;
    text-transform: none;
    letter-spacing: normal;
  }

  .bar-scanner-wrapper {
    width: 100%;
    position: relative;
    padding: 2rem;
    z-index: 1;
  }

  .bar-scanner-box {
    background: #f0f4f0;
    border: 2px solid #e8f0e8;
    position: relative;
    overflow: hidden;
    aspect-ratio: 4/3;
    border-radius: 20px;
  }

  .bar-scanner-box::before, .bar-scanner-box::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    z-index: 10;
    border-color: var(--primary-color);
  }

  .bar-scanner-box::before {
    top: -2px; left: -2px;
    border-top: 4px solid var(--primary-color);
    border-left: 4px solid var(--primary-color);
  }

  .bar-scanner-box::after {
    bottom: -2px; right: -2px;
    border-bottom: 4px solid var(--primary-color);
    border-right: 4px solid var(--primary-color);
  }

  .bar-corner-tr {
    position: absolute;
    top: -2px; right: -2px;
    width: 24px; height: 24px;
    border-top: 4px solid var(--primary-color);
    border-right: 4px solid var(--primary-color);
    z-index: 10;
  }

  .bar-corner-bl {
    position: absolute;
    bottom: -2px; left: -2px;
    width: 24px; height: 24px;
    border-bottom: 4px solid var(--primary-color);
    border-left: 4px solid var(--primary-color);
    z-index: 10;
  }

  .bar-scanner-box video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .bar-scan-line {
    position: absolute;
    left: 5%;
    right: 5%;
    height: 3px;
    background: var(--primary-color);
    z-index: 5;
    animation: barScanMove 2.5s ease-in-out infinite;
    top: 10%;
    pointer-events: none;
    box-shadow: 0 0 15px var(--primary-color);
  }

  @keyframes barScanMove {
    0%, 100% { top: 10%; opacity: 0; }
    20%, 80% { opacity: 0.8; }
    50% { top: 90%; }
  }

  .bar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    color: var(--text-muted);
  }

  .bar-placeholder p { 
    font-size: 0.95rem; 
    font-weight: 500; 
    color: var(--text-muted); 
    text-transform: none;
    letter-spacing: normal;
  }

  .bar-btn {
    width: 100%;
    margin-top: 1.5rem;
    padding: 1.1rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 18px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 10px 20px rgba(61, 106, 55, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .bar-btn:hover { 
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(61, 106, 55, 0.2);
  }

  .bar-btn.stop {
    background: white;
    color: #d32f2f;
    border: 2px solid #fee2e2;
    box-shadow: none;
  }

  .bar-btn.stop:hover { 
    background: #fff5f5;
    border-color: #fca5a5;
  }

  .bar-status-bar {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-top: 1.25rem;
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  .bar-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #edf2ed;
  }

  .bar-dot.active  { background: var(--primary-color); box-shadow: 0 0 8px var(--primary-color); animation: barPulse 2s infinite; }
  .bar-dot.success { background: var(--success); box-shadow: 0 0 8px var(--success); }
  .bar-dot.error   { background: #d32f2f; }

  @keyframes barPulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }

  .bar-error-msg {
    padding: 1rem 1.25rem;
    background: #fff5f5;
    border-radius: 14px;
    color: #d32f2f;
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bar-close-x {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 100;
    background: white;
    border: 1px solid #eef2ee;
    color: var(--text-muted);
    width: 42px;
    height: 42px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 4px 10px rgba(0,0,0,0.03);
  }

  .bar-close-x:hover { 
    color: #d32f2f; 
    border-color: #fca5a5;
    background: #fff5f5;
  }

  .bar-success-toast {
    position: absolute;
    inset: 0;
    background: white;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2.5rem;
    animation: barFadeIn 0.4s ease-out both;
  }

  @keyframes barFadeIn {
    from { transform: scale(1.05); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .bar-success-icon {
    width: 100px;
    height: 100px;
    background: var(--primary-light);
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    margin-bottom: 2rem;
    transform: rotate(-5deg);
  }

  .bar-success-title {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 0.75rem;
    color: #1a331a;
  }

  .bar-success-val {
    font-size: 1rem;
    color: var(--text-muted);
    font-weight: 600;
  }
`;

const BarcodeScanner = ({ onScanSuccess, onClose }) => {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanValue, setScanValue] = useState("");
  const lastDetectedRef = useRef("");

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
    setStatus("idle");
  }, []);

  const startScanning = useCallback(async () => {
    setError("");
    lastDetectedRef.current = "";
    try {
      const codeReader = new BrowserMultiFormatReader();
      readerRef.current = codeReader;

      const controls = await codeReader.decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current,
        (result, err) => {
          if (result) {
            const val = result.getText().trim();
            if (val !== lastDetectedRef.current) {
              lastDetectedRef.current = val;
              setScanValue(val);
              setStatus("success");
              setShowSuccess(true);

              // Give user a moment to see success
              setTimeout(() => {
                onScanSuccess(val);
                onClose();
              }, 1500);
            }
          }
        }
      );

      controlsRef.current = controls;
      setScanning(true);
      setStatus("active");
    } catch (e) {
      setError(e.message || "Camera access denied.");
      setStatus("error");
    }
  }, [onScanSuccess, onClose]);

  useEffect(() => {
    startScanning(); // Auto-start for better UX
    return () => stopScanning();
  }, [startScanning, stopScanning]);

  const statusLabel = { idle: "Ready", active: "Scanning Sensors", success: "Detected!", error: "Error" }[status];

  return (
    <div className="bar-modal">
      <style>{styles}</style>
      <div className="bar-card">
        <div className="bar-grid-bg" />
        <button className="bar-close-x" onClick={onClose}><X size={20} /></button>

        <header className="bar-header">
          <h1 className="bar-title">BAR<span>SCAN</span></h1>
          <p className="bar-subtitle">High-Speed Barcode Reader</p>
        </header>

        <div className="bar-scanner-wrapper">
          <div className="bar-scanner-box">
            <div className="bar-corner-tr" />
            <div className="bar-corner-bl" />
            <video ref={videoRef} muted playsInline style={{ display: scanning ? "block" : "none" }} />
            {scanning && <div className="bar-scan-line" />}

            {!scanning && !showSuccess && (
              <div className="bar-placeholder">
                <div className="bar-placeholder-icon">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bar-stripe" />)}
                </div>
                <p>Initializing sensor...</p>
              </div>
            )}

            {showSuccess && (
              <div className="bar-success-toast">
                <div className="bar-success-icon"><CheckCircle2 size={40} /></div>
                <div className="bar-success-title">Item Detected</div>
                <div className="bar-success-val">{scanValue}</div>
              </div>
            )}
          </div>

          <div className="bar-status-bar">
            <div className={`bar-dot ${status === "active" ? "active" : status === "success" ? "success" : status === "error" ? "error" : ""}`} />
            {statusLabel}
          </div>

          {error && <div className="bar-error-msg">{error}</div>}

          <button
            className={`bar-btn ${scanning ? "stop" : ""}`}
            onClick={scanning ? stopScanning : startScanning}
            style={{ display: showSuccess ? 'none' : 'flex' }}
          >
            {scanning ? <span>Stop Scanner</span> : <span>Start Barcode Reader</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
