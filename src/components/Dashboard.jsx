// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import AttendanceForm from './AttendanceForm.jsx';

const Dashboard = ({ user, onLogout }) => {
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '500+', label: 'Institutions' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

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
  ];

  const mockInstitution = {
    id: 'gov-001',
    name: 'Government Ministry of Digital Transformation',
    type: 'government'
  };

  return (
    <div className="app">
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            <span>Digital Liberia Pro</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              {user.profile?.photo && (
                <img 
                  src={user.profile.photo} 
                  alt="Profile" 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                />
              )}
              <div>
                <div style={{ 
                  color: 'var(--white)', 
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.dssn}
                </div>
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {user.profile?.institution || 'Digital Liberia User'}
                </div>
              </div>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={onLogout}
              style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem' }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', width: '100%' }}>
          {/* Welcome Section with User Profile */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '25px',
            padding: '3rem',
            marginBottom: '4rem',
            textAlign: 'center'
          }}>
            <h1 style={{ 
              fontSize: '3rem', 
              color: 'var(--white)', 
              marginBottom: '1rem',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Welcome back, {user.profile?.firstName || 'Valued User'}! 👋
            </h1>
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '1.3rem',
              fontWeight: '400',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Ready to manage your institution's attendance with enterprise-grade tools
            </p>
            
            {/* User Profile Info */}
            {user.profile && (
              <div style={{
                display: 'inline-flex',
                gap: '2rem',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1.5rem 2rem',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Full Name
                  </div>
                  <div style={{ color: 'var(--white)', fontWeight: '600', fontSize: '1.1rem' }}>
                    {user.profile.firstName} {user.profile.lastName}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    DSSN
                  </div>
                  <div style={{ color: 'var(--white)', fontWeight: '600', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                    {user.dssn}
                  </div>
                </div>
                {user.profile.institution && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Institution
                    </div>
                    <div style={{ color: 'var(--white)', fontWeight: '600', fontSize: '1.1rem' }}>
                      {user.profile.institution}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats Overview */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #fff, #f0f0f0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.5rem'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Action Cards */}
          <div className="action-grid">
            {actions.map((action, index) => (
              <div 
                key={index} 
                className="action-card floating"
                onClick={() => {
                  if (action.action === 'attendance') {
                    setShowAttendanceForm(true)
                  } else {
                    setActiveFeature(action.action)
                  }
                }}
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
                >
                  🚀 Launch Feature
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
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              ✕ Close Panel
            </button>
          </div>
        </div>
      )}

      {activeFeature && (
        <div className="modal-overlay" onClick={() => setActiveFeature(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              fontSize: '2rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, var(--text-dark), var(--info-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {activeFeature === 'attendance' ? '🎯 Record Attendance' : 
               activeFeature === 'reports' ? '📈 Analytics Dashboard' : '⚙️ Admin Console'}
            </h3>
            <p style={{ 
              textAlign: 'center', 
              color: 'var(--text-light)', 
              marginBottom: '2.5rem',
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}>
              {activeFeature === 'attendance' 
                ? 'Advanced attendance tracking with real-time verification and AI-powered insights.'
                : activeFeature === 'reports'
                ? 'Comprehensive analytics with predictive trends and automated reporting.'
                : 'Centralized management with granular controls and security auditing.'
              }
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => setActiveFeature(null)}
              style={{ width: '100%' }}
            >
              🚀 Launch Feature
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
