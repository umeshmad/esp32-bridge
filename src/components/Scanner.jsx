import { useState, useEffect, useRef, useCallback } from "react";
import jsQR from "jsqr";
import { X, Camera, Upload, ShieldAlert, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';

const styles = `
  .qr-scanner-modal {
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

  .qr-scanner-card {
    position: relative;
    width: 100%;
    max-width: 480px;
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid var(--primary-light);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 40px 80px -20px rgba(61, 106, 55, 0.2);
  }

  /* Header */
  .qr-header {
    text-align: center;
    padding: 2.5rem 2rem 1.5rem;
    background: #fcfdfc;
    position: relative;
    z-index: 1;
  }

  .qr-header h1 {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--primary-color);
    letter-spacing: -0.02em;
    margin: 0;
  }

  .qr-header p {
    margin-top: 0.5rem;
    font-size: 0.95rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  /* Tabs */
  .qr-tab-bar {
    display: flex;
    background: #f8faf8;
    padding: 6px;
    margin: 0 2rem;
    border-radius: 14px;
    position: relative;
    z-index: 1;
  }

  .qr-tab {
    flex: 1;
    padding: 0.8rem;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 700;
  }

  .qr-tab.active {
    color: var(--primary-color);
    background: white;
    box-shadow: 0 4px 12px rgba(61, 106, 55, 0.08);
  }

  .qr-panel {
    padding: 2rem;
    position: relative;
    z-index: 1;
  }

  /* Scanner View */
  .qr-video-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background: #f0f4f0;
    border-radius: 20px;
    overflow: hidden;
    border: 2px solid #e8f0e8;
  }

  .qr-video-container video {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }

  .qr-scan-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    background: rgba(61, 106, 55, 0.05);
  }

  .qr-scan-frame {
    width: 70%;
    height: 70%;
    position: absolute;
    left: 15%;
    top: 15%;
  }

  .qr-corner {
    position: absolute;
    width: 24px;
    height: 24px;
    border-color: var(--primary-color);
    border-style: solid;
    border-radius: 4px;
  }

  .qr-corner-tl { top: -2px; left: -2px; border-width: 4px 0 0 4px; border-bottom-left-radius: 0; border-top-right-radius: 0; }
  .qr-corner-tr { top: -2px; right: -2px; border-width: 4px 4px 0 0; border-bottom-right-radius: 0; border-top-left-radius: 0; }
  .qr-corner-bl { bottom: -2px; left: -2px; border-width: 0 0 4px 4px; border-top-left-radius: 0; border-bottom-right-radius: 0; }
  .qr-corner-br { bottom: -2px; right: -2px; border-width: 0 4px 4px 0; border-top-right-radius: 0; border-bottom-left-radius: 0; }

  .qr-scan-line {
    position: absolute;
    left: 5%;
    right: 5%;
    height: 3px;
    background: var(--primary-color);
    box-shadow: 0 0 15px var(--primary-color);
    animation: qrScanAnim 2.5s ease-in-out infinite;
    top: 10%;
    border-radius: 4px;
    opacity: 0.8;
  }

  @keyframes qrScanAnim {
    0%, 100% { top: 10%; opacity: 0; }
    20%, 80% { opacity: 0.8; }
    50% { top: 90%; }
  }

  /* Success State */
  .qr-success-view {
    position: absolute;
    inset: 0;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2.5rem;
    z-index: 20;
    animation: qrFadeIn 0.4s ease-out;
  }

  @keyframes qrFadeIn {
    from { opacity: 0; transform: scale(1.05); }
    to { opacity: 1; transform: scale(1); }
  }

  .qr-checkmark-ring {
    width: 100px;
    height: 100px;
    border-radius: 30px;
    background: var(--primary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
    transform: rotate(-5deg);
  }

  .qr-checkmark-icon { color: var(--primary-color); }

  .qr-success-title {
    font-size: 2.22rem;
    font-weight: 800;
    color: #1a331a;
    margin-bottom: 0.75rem;
  }

  .qr-success-title span { color: var(--primary-color); }

  .qr-success-sub {
    font-size: 1rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  /* File Upload */
  .qr-drop-zone {
    border: 2px dashed #e0ece0;
    border-radius: 20px;
    padding: 4rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f8faf8;
  }

  .qr-drop-zone:hover { 
    border-color: var(--primary-color); 
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(61, 106, 55, 0.05);
  }

  .qr-btn {
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
  }

  .qr-btn:hover { 
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(61, 106, 55, 0.2);
  }

  .qr-btn.stop {
    background: white;
    color: #d32f2f;
    border: 2px solid #fee2e2;
    box-shadow: none;
  }

  .qr-btn.stop:hover { 
    background: #fff5f5;
    border-color: #fca5a5;
  }

  .qr-error-box {
    margin-top: 1.5rem;
    padding: 1rem 1.25rem;
    background: #fff5f5;
    border-radius: 14px;
    font-size: 0.9rem;
    color: #d32f2f;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .qr-hint {
    margin-top: 1.5rem;
    padding: 1rem;
    background: var(--primary-light);
    border-radius: 14px;
    font-size: 0.85rem;
    color: var(--primary-color);
    font-weight: 600;
    line-height: 1.5;
    text-align: center;
  }

  .qr-close-btn {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 100;
    background: white;
    border: 1px solid #eef2ee;
    color: var(--text-muted);
    padding: 0.6rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 10px rgba(0,0,0,0.03);
  }

  .qr-close-btn:hover { 
    color: #d32f2f; 
    border-color: #fca5a5;
    background: #fff5f5;
  }

  canvas#qr-hidden-canvas { display: none; }
`;

function spawnConfetti() {
  const colors = ["#50e68c", "#ffc832", "#ff4060", "#60c8ff", "#e080ff"];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    el.className = "confetti-dot";
    el.style.left = Math.random() * 100 + "vw";
    el.style.top = "-10px";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = 1.2 + Math.random() * 1.8 + "s";
    el.style.animationDelay = Math.random() * 0.5 + "s";
    el.style.width = 4 + Math.random() * 8 + "px";
    el.style.height = 4 + Math.random() * 8 + "px";
    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

// Advanced Decoding Strategies
function tryDecode(jsQRInstance, imageData, width, height) {
  // Strategy 1: Standard
  let result = jsQRInstance(imageData.data, width, height, { inversionAttempts: "attemptBoth" });
  if (result) return result;

  // Strategy 2: Inverted First
  result = jsQRInstance(imageData.data, width, height, { inversionAttempts: "invertFirst" });
  if (result) return result;

  return null;
}

const Scanner = ({ onScanSuccess, onClose, title = "Scan QR Code" }) => {
  const [tab, setTab] = useState("camera");
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const scanningFlag = useRef(false);

  const doStopCamera = useCallback(() => {
    scanningFlag.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleSuccess = useCallback((data) => {
    setStatus('success');
    doStopCamera();
    spawnConfetti();
    setTimeout(() => {
      onScanSuccess(data);
      onClose();
    }, 2500);
  }, [onScanSuccess, onClose, doStopCamera]);

  const scanFrame = useCallback(() => {
    if (!scanningFlag.current) return;
    if (!videoRef.current || !canvasRef.current || !jsQR) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // Step 1: Scan Full Resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let code = tryDecode(jsQR, imageData, canvas.width, canvas.height);

    // Step 2: Center Crop Fallback (Optimized for Logo QR codes)
    if (!code) {
      const cropX = Math.floor(video.videoWidth * 0.15);
      const cropY = Math.floor(video.videoHeight * 0.15);
      const cropW = Math.floor(video.videoWidth * 0.7);
      const cropH = Math.floor(video.videoHeight * 0.7);
      canvas.width = cropW;
      canvas.height = cropH;
      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      imageData = ctx.getImageData(0, 0, cropW, cropH);
      code = tryDecode(jsQR, imageData, cropW, cropH);
    }

    if (code && code.data) {
      handleSuccess(code.data);
    } else {
      rafRef.current = requestAnimationFrame(scanFrame);
    }
  }, [handleSuccess]);

  const startCamera = async () => {
    setError(null);
    setStatus('idle');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().then(() => {
          scanningFlag.current = true;
          setScanning(true);
          rafRef.current = requestAnimationFrame(scanFrame);
        });
      };
    } catch (e) {
      setError("Camera access denied or unavailable.");
    }
  };

  useEffect(() => {
    if (tab === "camera") startCamera();
    else doStopCamera();
    return () => doStopCamera();
  }, [tab, doStopCamera]);

  const handleFile = (file) => {
    if (!file) return;
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = tryDecode(jsQR, imageData, canvas.width, canvas.height);

      URL.revokeObjectURL(objectUrl);
      if (code && code.data) handleSuccess(code.data);
      else setError("No QR code detected. Try a clearer image.");
    };
    img.onerror = () => {
      setError("Failed to load image file.");
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  return (
    <div className="qr-scanner-modal">
      <style>{styles}</style>
      <canvas id="qr-hidden-canvas" ref={canvasRef} />

      <div className="qr-scanner-card">
        <div className="qr-grid-bg" />

        <button className="qr-close-btn" onClick={onClose} title="Close Scanner">
          <X size={18} />
        </button>

        <div className="qr-header">
          <h1>QR<span>_</span>SCAN</h1>
          <p>Instant QR Code Decoder</p>
        </div>

        <div className="qr-tab-bar">
          <button className={`qr-tab ${tab === "camera" ? "active" : ""}`} onClick={() => setTab("camera")}>
            <Camera size={14} /> Camera
          </button>
          <button className={`qr-tab ${tab === "file" ? "active" : ""}`} onClick={() => setTab("file")}>
            <Upload size={14} /> Upload
          </button>
        </div>

        <div className="qr-panel">
          {tab === "camera" && (
            <>
              <div className="qr-video-container">
                <video ref={videoRef} playsInline muted style={{ display: scanning ? "block" : "none" }} />

                {scanning && (
                  <div className="qr-scan-overlay">
                    <div className="qr-scan-frame">
                      <div className="qr-corner qr-corner-tl" />
                      <div className="qr-corner qr-corner-tr" />
                      <div className="qr-corner qr-corner-bl" />
                      <div className="qr-corner qr-corner-br" />
                      <div className="qr-scan-line" />
                    </div>
                  </div>
                )}

                {!scanning && !error && status !== 'success' && (
                  <div className="qr-cam-idle">
                    <Loader2 className="animate-spin" size={32} color="#ffc832" />
                    <p>Waking Sensor...</p>
                  </div>
                )}

                {status === 'success' && (
                  <div className="qr-success-view">
                    <div className="qr-checkmark-ring">
                      <span className="qr-checkmark-icon">✓</span>
                    </div>
                    <h2 className="qr-success-title">Scan <span>Success!</span></h2>
                    <p className="qr-success-sub">Cart Verified Successfully</p>
                  </div>
                )}
              </div>

              {scanning ? (
                <button className="qr-btn stop" onClick={doStopCamera}>Stop Scanning</button>
              ) : (
                <button className="qr-btn" onClick={startCamera}>Start Camera</button>
              )}

              {scanning && (
                <div className="qr-hint">
                  Hold steady · Center the code · Good lighting
                </div>
              )}
            </>
          )}

          {tab === "file" && (
            <div className="qr-drop-zone"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('qr-file-input').click()}>
              <input type="file" id="qr-file-input" accept="image/*" style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])} />
              <Upload size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <div style={{ fontSize: '0.8rem', color: '#555' }}>
                <strong style={{ color: '#ffc832' }}>DRAG CART QR IMAGE</strong><br />
                OR CLICK TO UPLOAD
              </div>
            </div>
          )}

          {error && <div className="qr-error-box">⚠ {error}</div>}
        </div>
      </div>
    </div>
  );
};

export default Scanner;
