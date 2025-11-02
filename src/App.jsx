import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import QRScanner from './components/QRScanner.jsx'
import Login from './components/Login.jsx'
import AttendanceForm from './components/AttendanceForm.jsx'
import './styles/index.css'

// Mock auth context for now
const AuthContext = React.createContext()

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    return { 
      user: null, 
      loading: false, 
      logout: () => {} 
    }
  }
  return context
}

function Home() {
  const [showLogin, setShowLogin] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [activeFeature, setActiveFeature] = useState(null)
  const { user } = useAuth()

  const features = [
    { 
      icon: '🔒', 
      title: 'Military-Grade Security', 
      description: 'DSSN verification with end-to-end encryption',
      color: '#10b981'
    },
    { 
      icon: '📱', 
      title: 'Mobile App Integration', 
      description: 'Seamless integration with Digital Liberia Super App',
      color: '#3b82f6'
    },
    { 
      icon: '⚡', 
      title: 'Real-time Processing', 
      description: 'Instant attendance tracking and reporting',
      color: '#f59e0b'
    },
    { 
      icon: '🏢', 
      title: 'Multi-Institution', 
      description: 'Support for government, NGOs, and private sectors',
      color: '#8b5cf6'
    }
  ]

  const actions = [
    { 
      icon: '👥', 
      title: 'Record Attendance', 
      description: 'Scan DSSN QR codes to record check-ins and check-outs', 
      action: 'attendance',
      color: '#10b981'
    },
    { 
      icon: '📊', 
      title: 'View Reports', 
      description: 'Access real-time attendance analytics and reports', 
      action: 'reports',
      color: '#3b82f6'
    },
    { 
      icon: '⚙️', 
      title: 'Manage Institutions', 
      description: 'Configure settings for different organizations', 
      action: 'manage',
      color: '#8b5cf6'
    }
  ]

  const handleScan = (data) => {
    console.log('QR Code Scanned:', data)
    setShowScanner(false)
    // Here you would process the scanned DSSN
    alert(`DSSN Scanned: ${data}`)
  }

  const mockInstitution = {
    id: 'gov-001',
    name: 'Government Ministry',
    type: 'government'
  }

  if (user) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">🏢</span>
              <span>Digital Liberia Attendance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--white)' }}>Welcome, {user.dssn}</span>
              <button className="btn btn-secondary" onClick={() => {}}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="main-content">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ 
                fontSize: '2.5rem', 
                color: 'var(--white)', 
                marginBottom: '1rem',
                fontWeight: '700'
              }}>
                Attendance Dashboard
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>
                Manage attendance for your institution
              </p>
            </div>

            <div className="action-grid">
              {actions.map((action, index) => (
                <div 
                  key={index} 
                  className="action-card"
                  onClick={() => {
                    if (action.action === 'attendance') {
                      setShowAttendanceForm(true)
                    } else {
                      setActiveFeature(action.action)
                    }
                  }}
                  style={{ borderTop: `4px solid ${action.color}` }}
                >
                  <div 
                    className="card-icon"
                    style={{ backgroundColor: `${action.color}20`, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <h3 className="card-title">{action.title}</h3>
                  <p className="card-description">{action.description}</p>
                  <button 
                    className="btn btn-primary" 
                    style={{ 
                      width: '100%',
                      backgroundColor: action.color,
                      border: `2px solid ${action.color}`
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = `${action.color}d0`}
                    onMouseOut={(e) => e.target.style.backgroundColor = action.color}
                  >
                    Access Feature
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>

        {showAttendanceForm && (
          <div className="modal-overlay" onClick={() => setShowAttendanceForm(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <AttendanceForm institution={mockInstitution} />
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowAttendanceForm(false)}
                style={{ marginTop: '1rem', width: '100%' }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {activeFeature && (
          <div className="modal-overlay" onClick={() => setActiveFeature(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {activeFeature === 'attendance' ? 'Record Attendance' : 
                 activeFeature === 'reports' ? 'View Reports' : 'Manage Institutions'}
              </h3>
              <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '2rem' }}>
                This feature will open the {activeFeature} interface with full functionality.
              </p>
              <button 
                className="btn btn-secondary" 
                onClick={() => setActiveFeature(null)}
                style={{ width: '100%' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🏢</span>
            <span>Digital Liberia Attendance</span>
          </div>
          <nav>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowLogin(true)}
            >
              Login with DSSN
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <div className="hero-text">
            <h1>Revolutionary Attendance Management System</h1>
            <p>Leverage DSSN technology for secure, efficient attendance tracking across all institutions in Liberia.</p>
            
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <span 
                    className="feature-icon"
                    style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                  >
                    {feature.icon}
                  </span>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--white)' }}>
                      {feature.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, color: 'var(--white)' }}>
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowLogin(true)}
              >
                <span>Get Started with DSSN</span>
                <span>🚀</span>
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowScanner(true)}
              >
                <span>Scan QR Code</span>
                <span>📷</span>
              </button>
            </div>
          </div>

          <div className="action-grid">
            {actions.map((action, index) => (
              <div 
                key={index} 
                className="action-card"
                style={{ borderTop: `4px solid ${action.color}` }}
              >
                <div 
                  className="card-icon"
                  style={{ backgroundColor: `${action.color}20`, color: action.color }}
                >
                  {action.icon}
                </div>
                <h3 className="card-title">{action.title}</h3>
                <p className="card-description">{action.description}</p>
                <button 
                  className="btn btn-primary" 
                  style={{ 
                    width: '100%',
                    backgroundColor: action.color,
                    border: `2px solid ${action.color}`
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = `${action.color}d0`}
                  onMouseOut={(e) => e.target.style.backgroundColor = action.color}
                  onClick={() => setShowLogin(true)}
                >
                  Login to Access
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showLogin && (
        <Login 
          onLoginSuccess={(userData) => {
            setShowLogin(false)
            // In real app, this would set the user in context
            console.log('User logged in:', userData)
          }}
          onBack={() => setShowLogin(false)}
        />
      )}

      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          mode="attendance"
        />
      )}
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const authValue = {
    user,
    loading,
    logout: () => setUser(null)
  }

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Home />} />
          <Route path="/user" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  )
}

export default App
