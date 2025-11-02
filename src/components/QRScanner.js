// src/components/QRScanner.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';

const QRScanner = ({ onScan, onClose, mode = "attendance" }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [stream, setStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const initializationAttempted = useRef(false);
  const animationFrameRef = useRef(null);

  const initializeCamera = useCallback(async () => {
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;
    
    let currentStream = null;
    
    try {
      setError(null);
      setIsInitializing(true);
      setCameraReady(false);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser.');
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      if (!videoRef.current) {
        throw new Error('Camera view not ready.');
      }

      const video = videoRef.current;
      video.srcObject = null;

      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (envError) {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      }

      setStream(currentStream);
      video.srcObject = currentStream;
      video.playsInline = true;
      video.muted = true;
      video.setAttribute('playsinline', 'true');

      await new Promise((resolve) => {
        const onLoaded = () => {
          video.removeEventListener('loadedmetadata', onLoaded);
          video.removeEventListener('canplay', onLoaded);
          resolve();
        };
        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('canplay', onLoaded);
        setTimeout(resolve, 1000);
      });

      try {
        await video.play();
      } catch (playError) {
        console.warn('Video play warning:', playError);
      }

      setHasCamera(true);
      setCameraReady(true);
      setError(null);

    } catch (err) {
      console.error('Camera initialization failed:', err);
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      setError(err.message);
      setHasCamera(false);
      setCameraReady(false);
    } finally {
      setIsInitializing(false);
      initializationAttempted.current = false;
    }
  }, []);

  const startContinuousScan = useCallback(() => {
    if (!videoRef.current || !cameraReady) return;

    const scanFrame = () => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      try {
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        if (qrCode) {
          console.log('✅ QR code scanned:', qrCode.data);
          onScan(qrCode.data);
          stopContinuousScan();
          return;
        }
      } catch (error) {
        // Continue scanning
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [cameraReady, onScan]);

  const stopContinuousScan = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    if (cameraReady && hasCamera) {
      startContinuousScan();
    }

    return () => {
      stopContinuousScan();
    };
  }, [cameraReady, hasCamera, startContinuousScan]);

  const handleManualInput = () => {
    const qrCode = prompt(`Please enter the ${mode === "attendance" ? "DSSN" : "QR code data"} manually:`);
    if (qrCode && qrCode.trim()) {
      onScan(qrCode.trim());
    }
  };

  useEffect(() => {
    const initTimer = setTimeout(() => {
      initializeCamera();
    }, 500);

    return () => {
      clearTimeout(initTimer);
      stopContinuousScan();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [initializeCamera]);

  const retryCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setError(null);
    setHasCamera(false);
    setCameraReady(false);
    setIsInitializing(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    initializeCamera();
  };

  const closeScanner = () => {
    stopContinuousScan();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    onClose();
  };

  return (
    <div className="scanner-overlay">
      <div className="scanner-container">
        <div className="scanner-header">
          <h3>Scan {mode === "attendance" ? "DSSN QR Code" : "QR Code"}</h3>
          <button onClick={closeScanner} className="close-btn">
            ✕
          </button>
        </div>

        {error && (
          <div className={`scanner-error ${error.includes('No QR code') ? 'warning' : 'error'}`}>
            {error}
          </div>
        )}

        {isInitializing && (
          <div className="scanner-loading">
            <div className="spinner"></div>
            <p>Setting Up Camera...</p>
          </div>
        )}

        <div className={`scanner-video-container ${hasCamera && cameraReady ? 'active' : 'inactive'}`}>
          <video ref={videoRef} className="scanner-video" playsInline muted autoPlay />
          <canvas ref={canvasRef} className="hidden" />
          
          {hasCamera && cameraReady && (
            <div className="scanner-frame">
              <div className="scanner-corner top-left"></div>
              <div className="scanner-corner top-right"></div>
              <div className="scanner-corner bottom-left"></div>
              <div className="scanner-corner bottom-right"></div>
              {scanning && <div className="scanner-line"></div>}
            </div>
          )}

          {!isInitializing && !hasCamera && (
            <div className="scanner-fallback">
              <div className="camera-icon">📷</div>
              <p>Camera not available</p>
            </div>
          )}
        </div>

        {!isInitializing && hasCamera && cameraReady && (
          <div className="scanner-controls">
            <button onClick={handleManualInput} className="manual-btn">
              Enter Manually
            </button>
            <button onClick={retryCamera} className="retry-btn">
              Retry Camera
            </button>
          </div>
        )}

        {!isInitializing && !hasCamera && (
          <div className="scanner-fallback-controls">
            <button onClick={retryCamera} className="primary-btn">
              Try Camera Again
            </button>
            <button onClick={handleManualInput} className="secondary-btn">
              Enter Manually
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
