import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';

const QRScanner = ({ onScan, onClose, institution }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [stream, setStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const animationFrameRef = useRef(null);
  const scanAttemptsRef = useRef(0);

  // High-performance QR scanning with optimizations
  const startHighPerformanceScan = useCallback(() => {
    if (!videoRef.current || !cameraReady) return;

    let lastFrameTime = 0;
    const SCAN_INTERVAL = 100; // Scan every 100ms for better performance

    const scanFrame = (timestamp) => {
      if (!videoRef.current) return;

      // Throttle scanning for better performance
      if (timestamp - lastFrameTime < SCAN_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }
      lastFrameTime = timestamp;

      const video = videoRef.current;
      
      // Skip if video isn't ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      const canvas = canvasRef.current || document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });

      // Use smaller canvas for faster processing (optimize for QR codes)
      const scale = 0.7; // Reduce resolution for speed
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;

      // Draw and process frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      try {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        scanAttemptsRef.current++;

        if (qrCode) {
          const now = Date.now();
          // Prevent duplicate scans within 2 seconds
          if (now - lastScanTime > 2000) {
            console.log(`✅ QR code detected in ${scanAttemptsRef.current} attempts:`, qrCode.data);
            setLastScanTime(now);
            onScan(qrCode.data);
            stopScanning();
            return;
          }
        }

        // Visual feedback - show scanning is active
        if (scanAttemptsRef.current % 10 === 0) {
          console.log(`Scanning... Attempt ${scanAttemptsRef.current}`);
        }

      } catch (error) {
        // Continue scanning on error
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [cameraReady, onScan, lastScanTime]);

  const stopScanning = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setScanning(false);
  };

  // Enhanced camera initialization
  const initializeCamera = useCallback(async () => {
    let currentStream = null;
    
    try {
      setError(null);
      setIsInitializing(true);
      setCameraReady(false);
      scanAttemptsRef.current = 0;

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser.');
      }

      // Try to get the best camera available
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      };

      try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (envError) {
        console.log('Rear camera failed, trying front camera:', envError);
        constraints.video.facingMode = 'user';
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      setStream(currentStream);
      
      const video = videoRef.current;
      video.srcObject = currentStream;
      video.playsInline = true;
      video.muted = true;
      video.setAttribute('playsinline', 'true');

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        const onReady = () => {
          video.removeEventListener('loadeddata', onReady);
          video.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (err) => {
          video.removeEventListener('loadeddata', onReady);
          video.removeEventListener('error', onError);
          reject(err);
        };

        video.addEventListener('loadeddata', onReady);
        video.addEventListener('error', onError);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          video.removeEventListener('loadeddata', onReady);
          video.removeEventListener('error', onError);
          reject(new Error('Camera timeout'));
        }, 5000);
      });

      await video.play();

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
    }
  }, []);

  // Start scanning when camera is ready
  useEffect(() => {
    if (cameraReady && hasCamera) {
      setScanning(true);
      startHighPerformanceScan();
    }

    return () => {
      stopScanning();
    };
  }, [cameraReady, hasCamera, startHighPerformanceScan]);

  // Manual input as fallback
  const handleManualInput = () => {
    const dssn = prompt('Enter employee DSSN manually:');
    if (dssn && dssn.trim()) {
      onScan(dssn.trim());
    }
  };

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();

    return () => {
      stopScanning();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [initializeCamera]);

  const retryCamera = async () => {
    stopScanning();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setError(null);
    setHasCamera(false);
    setCameraReady(false);
    setIsInitializing(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    initializeCamera();
  };

  const closeScanner = () => {
    stopScanning();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-indigo-900/90 to-blue-900/90 border border-indigo-700/30 rounded-xl max-w-2xl w-full shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              QR Code Scanner
            </h3>
            <button
              onClick={closeScanner}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900/40 border border-red-700/30 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-200">{error}</span>
              </div>
            </div>
          )}

          {isInitializing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-white mb-2">Initializing Camera</h4>
              <p className="text-gray-300 text-sm">Setting up high-performance scanner...</p>
            </div>
          )}

          <div className={`relative bg-black rounded-lg overflow-hidden mb-4 min-h-[16rem] md:min-h-[24rem] flex items-center justify-center ${
            hasCamera && cameraReady ? 'border-2 border-green-400' : 'border-2 border-gray-600'
          }`}>
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            
            <canvas ref={canvasRef} className="hidden" />
            
            {hasCamera && cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Scanner frame with animation */}
                <div className="border-2 border-white rounded-lg w-48 h-48 md:w-64 md:h-64 relative">
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-green-400"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-green-400"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-green-400"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-green-400"></div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
                  
                  {/* Pulse animation */}
                  <div className="absolute inset-0 border-2 border-green-300 rounded-lg animate-ping opacity-20"></div>
                </div>
              </div>
            )}

            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {scanning ? `Scanning... (${scanAttemptsRef.current})` : 
               isInitializing ? 'Initializing...' : 
               hasCamera && cameraReady ? 'High-Performance Scanner' : 
               'Camera Offline'}
            </div>

            {!isInitializing && !hasCamera && (
              <div className="text-center text-white p-4">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">Camera not available</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleManualInput}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Manual Entry
            </button>

            <button
              onClick={retryCamera}
              className="flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Camera
            </button>
          </div>

          {scanning && (
            <div className="mt-4 text-center">
              <p className="text-green-300 text-sm animate-pulse">
                🔍 Actively scanning for QR codes...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
