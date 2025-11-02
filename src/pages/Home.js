// src/pages/Home.js
import React, { useState } from 'react';
import Login from '../components/Login';
import InstitutionSelector from '../components/InstitutionSelector';
import { useAuth } from '../services/auth';

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showInstitutionSelector, setShowInstitutionSelector] = useState(false);
  const { user, logout } = useAuth();

  if (user) {
    return (
      <div className="home-page">
        <header className="home-header">
          <div className="container">
            <h1>Digital Liberia Attendance System</h1>
            <p>Welcome, {user.dssn}</p>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        <div className="home-content">
          <div className="container">
            <div className="action-cards">
              <div className="card" onClick={() => setShowInstitutionSelector(true)}>
                <div className="card-icon">📊</div>
                <h3>Record Attendance</h3>
                <p>Scan DSSN codes to record check-ins and check-outs</p>
              </div>
              
              <div className="card">
                <div className="card-icon">👥</div>
                <h3>View Attendance</h3>
                <p>Check attendance records and reports</p>
              </div>
              
              <div className="card">
                <div className="card-icon">⚙️</div>
                <h3>Administration</h3>
                <p>Manage institutions and settings</p>
              </div>
            </div>
          </div>
        </div>

        {showInstitutionSelector && (
          <InstitutionSelector onClose={() => setShowInstitutionSelector(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="container">
          <h1>Digital Liberia Attendance System</h1>
          <p>Secure attendance tracking for government institutions, NGOs, and private companies</p>
        </div>
      </header>

      <div className="home-content">
        <div className="container">
          <div className="hero-section">
            <div className="hero-text">
              <h2>Streamline Your Attendance Management</h2>
              <p>Use DSSN-based QR codes for secure, efficient attendance tracking across all institutions.</p>
              
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">🔒</span>
                  <span>Secure DSSN Verification</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📱</span>
                  <span>Mobile App Integration</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">⚡</span>
                  <span>Real-time Processing</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🏢</span>
                  <span>Multi-institution Support</span>
                </div>
              </div>

              <button 
                onClick={() => setShowLogin(true)}
                className="login-btn primary-btn"
              >
                Login with DSSN
              </button>
            </div>

            <div className="hero-visual">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-preview">
                    <div className="notification-preview">
                      <p>Attendance Verification Request</p>
                      <div className="notification-buttons">
                        <button className="approve-btn">Approve</button>
                        <button className="deny-btn">Deny</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLogin && (
        <Login 
          onLoginSuccess={() => setShowLogin(false)}
          onBack={() => setShowLogin(false)}
        />
      )}
    </div>
  );
};

export default Home;
