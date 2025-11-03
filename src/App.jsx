import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import QRScanner from './components/QRScanner.jsx'
import Login from './components/Login.jsx'
import AttendanceForm from './components/AttendanceForm.jsx'
import Dashboard from './components/Dashboard.jsx'
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
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      setScrolled(isScrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    { 
      icon: '🔒', 
      title: 'Military-Grade Security', 
      description: 'DSSN verification with end-to-end encryption and blockchain-level security protocols',
      color: '#00d4aa'
    },
    { 
      icon: '📱', 
      title: 'Smart Mobile Integration', 
      description: 'Seamless real-time sync with Digital Liberia Super App and instant push notifications',
      color: '#118ab2'
    },
    { 
      icon: '⚡', 
      title: 'Lightning Fast Processing', 
      description: 'AI-powered attendance tracking with sub-second processing and real-time analytics',
      color: '#7209b7'
    },
    { 
      icon: '🏢', 
      title: 'Enterprise Ready', 
      description: 'Multi-tenant architecture supporting government, NGOs, and private corporations',
      color: '#ffd166'
    }
  ]

  const actions = [
    { 
      icon: '👥', 
      title: 'Record Attendance', 
      description: 'Advanced QR scanning with AI-powered DSSN verification and biometric validation', 
      action: 'attendance',
      color: '#00d4aa'
    },
    { 
      icon: '📊', 
      title: 'Analytics Dashboard', 
      description: 'Real-time insights with predictive analytics and automated reporting systems', 
      action: 'reports',
      color: '#118ab2'
    },
    { 
      icon: '⚙️', 
      title: 'Admin Console', 
      description: 'Centralized management with role-based access control and audit trails', 
      action: 'manage',
      color: '#7209b7'
    }
  ]

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '500+', label: 'Institutions' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ]

  const handleScan = (data) => {
    console.log('QR Code Scanned:', data)
    setShowScanner(false)
    // Here you would process the scanned DSSN
    alert(`🚀 DSSN Verified: ${data}\n\nAttendance recorded successfully!`)
  }

  const mockInstitution = {
    id: 'gov-001',
    name: 'Government Ministry of Digital Transformation',
    type: 'government'
  }

  // If user is logged in, show Dashboard instead of Home
  if (user) {
    return <Dashboard user={user} onLogout={() => {}} />
  }

  return (
    <div className="app">
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            <span>Digital Liberia Pro</span>
          </div>
          <nav>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowLogin(true)}
            >
              🔐 DSSN Login
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <div className="hero-text">
            <h1>
              The Future of <span style={{background: 'linear-gradient(135deg, #ffd166, #ef476f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Attendance</span> Management is Here
            </h1>
            <p>
              Enterprise-grade DSSN verification powered by cutting-edge technology. 
              Secure, fast, and built for scale.
            </p>
            
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-item pulse">
                  <span 
                    className="feature-icon"
                    style={{ 
                      background: `linear-gradient(135deg, ${feature.color}, ${feature.color}80)`,
                      boxShadow: `0 8px 25px ${feature.color}40`
                    }}
                  >
                    {feature.icon}
                  </span>
                  <div className="feature-content">
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-actions">
              <button 
                className="btn btn-primary glow"
                onClick={() => setShowLogin(true)}
              >
                <span>🚀 Get Started</span>
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowScanner(true)}
              >
                <span>📷 Quick Scan</span>
              </button>
            </div>
          </div>

          <div className="action-grid">
            {actions.map((action, index) => (
              <div 
                key={index} 
                className="action-card floating"
                style={{ 
                  borderTop: `4px solid ${action.color}`,
                  background: `linear-gradient(135deg, var(--card-bg), rgba(255, 255, 255, 0.9))`
                }}
              >
                <div 
                  className="card-icon glow"
                  style={{ 
                    backgroundColor: `${action.color}20`, 
                    color: action.color,
                    background: `linear-gradient(135deg, ${action.color}30, ${action.color}10)`
                  }}
                >
                  {action.icon}
                </div>
                <h3 className="card-title">{action.title}</h3>
                <p className="card-description">{action.description}</p>
                <button 
                  className="btn btn-primary pulse"
                  style={{ 
                    width: '100%',
                    background: `linear-gradient(135deg, ${action.color}, ${action.color}d0)`,
                    border: `2px solid ${action.color}`
                  }}
                  onClick={() => setShowLogin(true)}
                >
                  🔐 Authenticate to Access
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
