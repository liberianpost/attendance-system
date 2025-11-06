import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';

const QRScanner = ({ onScan, onClose, institution }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [stream, setStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const initializationAttempted = useRef(false);
  const animationFrameRef = useRef(null);

  // Check browser support for QR scanning
  const supportsNativeQR = () => {
    return 'BarcodeDetector' in window;
  };

  const supportsQRScanning = () => {
    return supportsNativeQR() || true; // Always true now that we have jsQR fallback
  };

  // Enhanced capture and scan with multiple methods
  const captureAndScan = async () => {
    if (!videoRef.current || !cameraReady) {
      setError('Camera not ready. Please wait for camera initialization or try again.');
      return;
    }

    try {
      setError(null);
      setScanning(true);
      
      const video = videoRef.current;
      
      // Check camera activity
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('Camera not active. Please reinitialize camera.');
      }

      // Create canvas for image processing
      const canvas = canvasRef.current || document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for processing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Method 1: Try native QR detection first (faster)
      if (supportsNativeQR()) {
        try {
          const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await barcodeDetector.detect(canvas);
          
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue;
            console.log('✅ QR code scanned (native):', qrData);
            onScan(qrData);
            setScanning(false);
            return;
          }
        } catch (nativeError) {
          console.log('Native QR detection failed, falling back to jsQR:', nativeError);
        }
      }

      // Method 2: Use jsQR library (works in all browsers)
      try {
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (qrCode) {
          console.log('✅ QR code scanned (jsQR):', qrCode.data);
          onScan(qrCode.data);
          setScanning(false);
          return;
        } else {
          setError('No QR code detected. Ensure the QR code is clearly visible in the frame.');
        }
      } catch (jsQRError) {
        console.log('jsQR detection failed:', jsQRError);
        setError('QR scanning failed. Please use manual entry or try again.');
      }
      
    } catch (error) {
      console.error('Capture error:', error);
      setError(error.message || 'Failed to capture image. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  // Continuous scanning mode
  const startContinuousScan = useCallback(() => {
    if (!videoRef.current || !cameraReady || !supportsQRScanning()) return;

    const scanFrame = () => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Try jsQR for continuous scanning (more reliable cross-browser)
      try {
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        if (qrCode) {
          console.log('✅ QR code scanned (continuous):', qrCode.data);
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

  // Start continuous scanning when camera is ready
  useEffect(() => {
    if (cameraReady && hasCamera) {
      // Start continuous scanning automatically
      startContinuousScan();
    }

    return () => {
      stopContinuousScan();
    };
  }, [cameraReady, hasCamera, startContinuousScan]);

  // Manual input
  const handleManualInput = () => {
    const qrCode = prompt('Please enter the DSSN QR code data manually:');
    if (qrCode && qrCode.trim()) {
      onScan(qrCode.trim());
    }
  };

  // Enhanced camera initialization
  const initializeCamera = useCallback(async () => {
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;
    
    let currentStream = null;
    
    try {
      setError(null);
      setIsInitializing(true);
      setCameraReady(false);

      // Check browser support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser. Please use Chrome, Firefox, or Safari.');
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      if (!videoRef.current) {
        throw new Error('Camera view not ready. Please try again.');
      }

      const video = videoRef.current;
      video.srcObject = null;

      // Request camera access
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
            <div className={`mb-4 p-4 rounded-lg ${
              error.includes('No QR code') ? 'bg-yellow-900/40 border border-yellow-700/30' : 'bg-red-900/40 border border-red-700/30'
            }`}>
              <div className="flex items-start">
                <svg className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${
                  error.includes('No QR code') ? 'text-yellow-400' : 'text-red-400'
                }`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <span className={error.includes('No QR code') ? 'text-yellow-200' : 'text-red-200'}>
                    {error}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isInitializing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-white mb-2">Setting Up Camera</h4>
              <p className="text-gray-300 text-sm">Please allow camera permissions when prompted...</p>
            </div>
          )}

          <div 
            ref={videoContainerRef}
            className={`relative bg-black rounded-lg overflow-hidden mb-4 min-h-[16rem] md:min-h-[24rem] flex items-center justify-center ${
              hasCamera && cameraReady ? 'border-2 border-green-400' : 'border-2 border-gray-600'
            }`}
          >
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            
            {/* Hidden canvas for QR processing */}
            <canvas ref={canvasRef} className="hidden" />
            
            {hasCamera && cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-white rounded-lg w-48 h-48 md:w-64 md:h-64 relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white"></div>
                  
                  {/* Scanning animation */}
                  {scanning && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-400 animate-pulse"></div>
                  )}
                </div>
              </div>
            )}

            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {isInitializing ? 'Initializing...' : 
               hasCamera && cameraReady ? 'Live Camera Feed' : 
               'Camera Offline'}
            </div>

            {!isInitializing && !hasCamera && (
              <div className="text-center text-white p-4">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">Camera not available</p>
              </div>
            )}
          </div>

          {!isInitializing && hasCamera && cameraReady && (
            <>
              {/* Browser compatibility info */}
              <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700/30 rounded-lg">
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-200">
                    {supportsNativeQR() 
                      ? '✅ Automatic QR scanning enabled (native browser support)' 
                      : '✅ Automatic QR scanning enabled (JavaScript fallback)'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                <button
                  onClick={captureAndScan}
                  disabled={scanning}
                  className={`flex items-center justify-center px-6 py-3 rounded-lg text-white transition-colors font-medium ${
                    scanning ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {scanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Scan QR Code
                    </>
                  )}
                </button>

                <button
                  onClick={handleManualInput}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  Manual Entry
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={retryCamera}
                  className="text-blue-300 hover:text-blue-100 text-sm underline"
                >
                  Reinitialize Camera
                </button>
              </div>
            </>
          )}

          {!isInitializing && !hasCamera && (
            <div className="text-center py-4">
              <h4 className="text-xl font-semibold text-white mb-2">Camera Unavailable</h4>
              <p className="text-gray-300 mb-6">
                {error || 'Unable to access camera. You can still verify DSSN manually.'}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={retryCamera}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors font-medium"
                >
                  Try Camera Again
                </button>
                <button
                  onClick={handleManualInput}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors font-medium"
                >
                  Enter DSSN Manually
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
