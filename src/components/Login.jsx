import React, { useState, useEffect } from 'react';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4NndmuQHTCKh7IyQYAz3DL_r8mttyRYg",
  authDomain: "digitalliberia-notification.firebaseapp.com",
  projectId: "digitalliberia-notification",
  storageBucket: "digitalliberia-notification.appspot.com",
  messagingSenderId: "537791418352",
  appId: "1:537791418352:web:378b48439b2c9bed6dd735"
};

// Initialize Firebase
let messaging = null;
if (typeof window !== 'undefined') {
  try {
    const { initializeApp } = require('firebase/app');
    const { getMessaging, getToken, onMessage } = require('firebase/messaging');
    
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Firebase initialization skipped in non-browser environment');
  }
}

// Web Push VAPID public key
const vapidKey = "BEICu1bx8LKW5j7cag5tU9B2qfcejWi7QPm8a95jFODSIUNRiellygLGroK9NyWt-3WsTiUZscmS311gGXiXV7Q";

// Enhanced notification permission request
const requestNotificationPermission = async () => {
  try {
    if (!messaging) return null;
    
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered:', registration);

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const currentToken = await getToken(messaging, { 
        vapidKey: vapidKey,
        serviceWorkerRegistration: registration
      });
      
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        localStorage.setItem('fcmToken', currentToken);
        return currentToken;
      }
    }
    return null;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// API configuration - Use the direct backend URL (not through proxy)
const API_BASE = 'https://libpayapp.liberianpost.com:8081';

const api = {
  post: async (url, data) => {
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    return response.json();
  },
  
  get: async (url) => {
    const response = await fetch(`${API_BASE}${url}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    return response.json();
  }
};

function Login({ onLoginSuccess, onBack }) {
  const [dssn, setDssn] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [challengeId, setChallengeId] = useState(null);
  const [polling, setPolling] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);
  const [pushNotificationStatus, setPushNotificationStatus] = useState(null);

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const requestDSSNChallenge = async (dssn) => {
    try {
      const fcmToken = localStorage.getItem('fcmToken') || await requestNotificationPermission();
      
      const response = await api.post('/gov-services/request', { 
        dssn, 
        service: "Digital Liberia Attendance System",
        fcmToken,
        requestData: {
          timestamp: new Date().toISOString(),
          service: "Digital Liberia Attendance System",
          origin: window.location.origin
        }
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to initiate challenge');
      }
      
      return response;
    } catch (error) {
      console.error('Error requesting DSSN challenge:', error);
      throw new Error(error.message || "Failed to initiate DSSN challenge");
    }
  };

  const pollChallengeStatus = async (challengeId) => {
    try {
      const response = await api.get(`/gov-services/status/${challengeId}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to check challenge status');
      }
      
      return response;
    } catch (error) {
      console.error('Error polling challenge status:', error);
      throw new Error(error.message || "Failed to check approval status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setPushNotificationStatus(null);

    if (!dssn.trim()) {
      setError("Please enter your DSSN");
      setLoading(false);
      return;
    }

    try {
      const response = await requestDSSNChallenge(dssn);
      setChallengeId(response.challengeId);
      setPolling(true);
      setLoading(false);
      
      if (response.pushNotification) {
        setPushNotificationStatus({
          sent: response.pushNotification.sent,
          hasToken: response.pushNotification.hasToken,
          error: response.pushNotification.error
        });
      }
      
      const interval = setInterval(async () => {
        try {
          const statusResponse = await pollChallengeStatus(response.challengeId);
          
          if (statusResponse.status === 'approved') {
            clearInterval(interval);
            setPolling(false);
            console.log('Login approved with token:', statusResponse.govToken);
            
            // Call the success callback with user data
            onLoginSuccess({
              dssn: dssn,
              govToken: statusResponse.govToken,
              challengeId: response.challengeId,
              timestamp: new Date().toISOString()
            });
            
          } else if (statusResponse.status === 'denied') {
            clearInterval(interval);
            setPolling(false);
            setError("Access was denied on your mobile device");
          }
        } catch (error) {
          console.error('Error polling challenge status:', error);
          clearInterval(interval);
          setPolling(false);
          setError(error.message);
        }
      }, 3000);

      setPollInterval(interval);

      setTimeout(() => {
        if (polling) {
          clearInterval(interval);
          setPolling(false);
          setError("Request timed out. Please try again.");
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="back-button"
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Welcome
        </button>

        <div className="login-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="login-logo" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
          <h2 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
            Secure DSSN Verification
          </h2>
          <p style={{ color: 'var(--text-light)' }}>
            Enter your DSSN to access Digital Liberia Attendance System
          </p>
        </div>
        
        <div className="login-form">
          {error && (
            <div className="error-message" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--error-color)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}
          
          {pushNotificationStatus && !pushNotificationStatus.sent && (
            <div className="warning-message" style={{
              background: 'rgba(245, 158, 11, 0.1)',
              color: 'var(--warning-color)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              {!pushNotificationStatus.hasToken ? (
                "Please install the Digital Liberia mobile app to receive verification requests"
              ) : (
                `Notification error: ${pushNotificationStatus.error || 'Unknown error'}`
              )}
            </div>
          )}
          
          {polling ? (
            <div className="verification-pending" style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{
                border: '4px solid rgba(59, 130, 246, 0.3)',
                borderTop: '4px solid var(--info-color)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <h3 style={{ margin: '1rem 0', color: 'var(--text-dark)' }}>
                Waiting for Mobile Approval
              </h3>
              <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
                Please check your mobile app to approve this verification request.
              </p>
              {pushNotificationStatus?.sent && (
                <p className="notification-sent" style={{
                  color: 'var(--success-color)',
                  fontWeight: '500',
                  marginBottom: '1rem'
                }}>
                  ✓ Push notification sent to your mobile device
                </p>
              )}
              <p className="challenge-id" style={{
                fontSize: '0.875rem',
                color: 'var(--text-light)',
                fontFamily: 'monospace',
                marginBottom: '1rem'
              }}>
                Verification ID: {challengeId}
              </p>
              <p className="timeout-notice" style={{
                fontSize: '0.875rem',
                color: 'var(--text-light)'
              }}>
                This request will timeout in 5 minutes
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="dssn"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: 'var(--text-dark)'
                  }}
                >
                  Digital Social Security Number (DSSN)
                </label>
                <input 
                  type="text" 
                  id="dssn" 
                  value={dssn}
                  onChange={(e) => setDssn(e.target.value)}
                  placeholder="Enter your DSSN" 
                  required
                  autoFocus
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s'
                  }}
                />
                <p className="input-help" style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-light)',
                  marginTop: '0.5rem'
                }}>
                  Enter your DSSN and approve the request on your mobile app
                </p>
              </div>
              
              <button 
                type="submit" 
                className="login-submit-btn"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem 2rem',
                  background: loading ? '#9ca3af' : 'var(--success-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-small" style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></span>
                    Verifying...
                  </>
                ) : 'Verify with DSSN'}
              </button>
            </form>
          )}

          <div className="login-footer" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p className="mobile-app-info" style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
              Don't have the mobile app?{' '}
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  alert("The Digital Liberia mobile app is available on the App Store and Google Play Store");
                }}
                style={{ color: 'var(--info-color)', textDecoration: 'none' }}
              >
                Download it here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;
