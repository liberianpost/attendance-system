import React, { useState, useEffect } from 'react';
import AttendanceForm from './AttendanceForm.jsx';

const Dashboard = ({ user, onLogout }) => {
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock data for institutions
  const governmentInstitutions = [
    {
      id: 'gov-001',
      name: 'Ministry of Finance and Development Planning',
      type: 'government',
      employees: 250,
      location: 'Monrovia',
      icon: '🏛️'
    },
    {
      id: 'gov-002',
      name: 'Ministry of Education',
      type: 'government',
      employees: 180,
      location: 'Monrovia',
      icon: '📚'
    },
    {
      id: 'gov-003',
      name: 'Ministry of Health',
      type: 'government',
      employees: 320,
      location: 'Monrovia',
      icon: '🏥'
    },
    {
      id: 'gov-004',
      name: 'Ministry of Foreign Affairs',
      type: 'government',
      employees: 150,
      location: 'Monrovia',
      icon: '🌍'
    },
    {
      id: 'gov-005',
      name: 'Ministry of Justice',
      type: 'government',
      employees: 200,
      location: 'Monrovia',
      icon: '⚖️'
    },
    {
      id: 'gov-006',
      name: 'Liberia Revenue Authority',
      type: 'government',
      employees: 280,
      location: 'Monrovia',
      icon: '💰'
    }
  ];

  const privateCompanies = [
    {
      id: 'private-001',
      name: 'Digital Liberia',
      type: 'private',
      employees: 45,
      location: 'Monrovia',
      icon: '🚀'
    },
    {
      id: 'private-002',
      name: 'Lonestar Cell MTN',
      type: 'private',
      employees: 120,
      location: 'Monrovia',
      icon: '📱'
    },
    {
      id: 'private-003',
      name: 'Ecobank Liberia',
      type: 'private',
      employees: 85,
      location: 'Monrovia',
      icon: '🏦'
    }
  ];

  const schools = [
    {
      id: 'school-001',
      name: 'University of Liberia',
      type: 'school',
      employees: 300,
      location: 'Monrovia',
      icon: '🎓'
    },
    {
      id: 'school-002',
      name: 'Cuttington University',
      type: 'school',
      employees: 180,
      location: 'Suakoko',
      icon: '📖'
    },
    {
      id: 'school-003',
      name: 'St. Teresa\'s Convent',
      type: 'school',
      employees: 65,
      location: 'Monrovia',
      icon: '✏️'
    },
    {
      id: 'school-004',
      name: 'BWI (Booker Washington Institute)',
      type: 'school',
      employees: 95,
      location: 'Kakata',
      icon: '🔧'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '500+', label: 'Institutions' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  const InstitutionCard = ({ institution, onSelect }) => (
    <div 
      className="institution-card"
      onClick={() => onSelect(institution)}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
      }}
    >
      <div 
        style={{
          fontSize: '2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '60px'
        }}
      >
        {institution.icon}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ 
          color: 'var(--white)', 
          margin: '0 0 0.5rem 0',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          {institution.name}
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <span>👥 {institution.employees} employees</span>
          <span>📍 {institution.location}</span>
        </div>
      </div>
      <div style={{ 
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '1.5rem'
      }}>
        →
      </div>
    </div>
  );

  const InstitutionSection = ({ title, institutions, icon, color }) => (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          fontSize: '2rem',
          background: `linear-gradient(135deg, ${color}, ${color}80)`,
          borderRadius: '12px',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50px',
          height: '50px'
        }}>
          {icon}
        </div>
        <div>
          <h2 style={{ 
            color: 'var(--white)', 
            margin: '0',
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            {title}
          </h2>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            margin: '0.25rem 0 0 0',
            fontSize: '0.95rem'
          }}>
            {institutions.length} institutions registered
          </p>
        </div>
      </div>
      
      <div>
        {institutions.map(institution => (
          <InstitutionCard 
            key={institution.id} 
            institution={institution}
            onSelect={setSelectedInstitution}
          />
        ))}
      </div>
    </div>
  );

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
              Manage attendance across government institutions, private companies, and educational facilities
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
                {user.profile.email && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Email
                    </div>
                    <div style={{ color: 'var(--white)', fontWeight: '600', fontSize: '1.1rem' }}>
                      {user.profile.email}
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

          {/* Institution Categories */}
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ 
              color: 'var(--white)', 
              fontSize: '2.5rem',
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: '3rem',
              background: 'linear-gradient(135deg, #ffffff, rgba(255, 255, 255, 0.8))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Manage Institutional Attendance
            </h2>
            
            <InstitutionSection 
              title="Government Institutions"
              institutions={governmentInstitutions}
              icon="🏛️"
              color="#00d4aa"
            />
            
            <InstitutionSection 
              title="Private Companies"
              institutions={privateCompanies}
              icon="🏢"
              color="#118ab2"
            />
            
            <InstitutionSection 
              title="Schools & Universities"
              institutions={schools}
              icon="🎓"
              color="#7209b7"
            />
          </div>

          {/* Quick Actions */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '2.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: 'var(--white)', 
              fontSize: '1.8rem',
              fontWeight: '700',
              marginBottom: '1rem'
            }}>
              Quick Actions
            </h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '1.1rem',
              marginBottom: '2rem'
            }}>
              Start managing attendance or explore advanced features
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAttendanceForm(true)}
                style={{ 
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                📷 Record Attendance
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setActiveFeature('reports')}
                style={{ 
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                📊 View Reports
              </button>
            </div>
          </div>
        </div>
      </main>

      {showAttendanceForm && (
        <div className="modal-overlay" onClick={() => setShowAttendanceForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <AttendanceForm institution={selectedInstitution} />
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

      {selectedInstitution && (
        <div className="modal-overlay" onClick={() => setSelectedInstitution(null)}>
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
              {selectedInstitution.name}
            </h3>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                {selectedInstitution.icon}
              </div>
              <p style={{ 
                color: 'var(--text-light)', 
                marginBottom: '1rem',
                fontSize: '1.1rem'
              }}>
                Type: {selectedInstitution.type}
              </p>
              <p style={{ 
                color: 'var(--text-light)', 
                marginBottom: '1rem',
                fontSize: '1.1rem'
              }}>
                Employees: {selectedInstitution.employees}
              </p>
              <p style={{ 
                color: 'var(--text-light)', 
                marginBottom: '2rem',
                fontSize: '1.1rem'
              }}>
                Location: {selectedInstitution.location}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowAttendanceForm(true);
                  setSelectedInstitution(null);
                }}
                style={{ width: '100%' }}
              >
                📷 Record Attendance for {selectedInstitution.name}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedInstitution(null)}
                style={{ width: '100%' }}
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
