import React, { useState, useEffect } from 'react';
import QRCodeScanner from './QRScanner.jsx';

// Add API configuration at the top (same as in Login)
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

const Dashboard = ({ user, onLogout }) => {
    const [activeSession, setActiveSession] = useState(null);
    const [institutionStats, setInstitutionStats] = useState(null);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [scannedEmployee, setScannedEmployee] = useState(null);
    const [recentRecords, setRecentRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('=== USER OBJECT DEBUG ===');
        console.log('Full user object:', user);
        console.log('User profile:', user?.profile);
        console.log('Profile keys:', user?.profile ? Object.keys(user.profile) : 'No profile');
        console.log('Institution:', user?.profile?.institution_of_work);
        console.log('Position:', user?.profile?.position);
        console.log('=== END DEBUG ===');
        
        if (user && user.dssn) {
            fetchInstitutionStats();
            fetchRecentRecords();
        } else {
            setError('No user data available');
            setLoading(false);
        }
    }, [user]);

    const fetchInstitutionStats = async () => {
        try {
            setLoading(true);
            const response = await api.post('/institution-stats', {
                dssn: user.dssn
            });
            
            if (response.success) {
                setInstitutionStats(response.stats);
                setRecentRecords(response.recentRecords || []);
            } else {
                setError('Failed to load institution stats');
            }
        } catch (error) {
            console.error('Error fetching institution stats:', error);
            setError('Error loading dashboard data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentRecords = async () => {
        try {
            const response = await api.post('/recent-attendance', {
                dssn: user.dssn
            });
            
            if (response.success) {
                setRecentRecords(response.records || []);
            }
        } catch (error) {
            console.error('Error fetching recent records:', error);
        }
    };

    const startAttendanceProcess = async () => {
        try {
            console.log('=== START ATTENDANCE DEBUG ===');
            console.log('User profile institution:', user.profile?.institution_of_work);
            console.log('User profile position:', user.profile?.position);
            console.log('=== END DEBUG ===');
            
            // Use the institution from profile or fallback to known value
            const institution = user.profile?.institution_of_work || 'DIGITAL LIBERIA';
            
            const response = await api.post('/start-attendance', {
                dssn: user.dssn,
                institution: institution
            });

            if (response.success) {
                setActiveSession(response.sessionToken);
                setShowQRScanner(true);
            } else {
                alert('Failed to start attendance: ' + response.error);
            }
        } catch (error) {
            console.error('Error starting attendance:', error);
            alert('Failed to start attendance process: ' + error.message);
        }
    };

    const handleQRScan = async (employeeDssn) => {
        try {
            const response = await api.post('/scan-qr', {
                dssn: user.dssn,
                employeeDssn: employeeDssn,
                sessionToken: activeSession
            });

            if (response.success) {
                setScannedEmployee(response.employee);
                // Refresh data after successful scan
                fetchInstitutionStats();
            } else {
                alert('Scan failed: ' + response.error);
            }
        } catch (error) {
            console.error('Error processing QR scan:', error);
            alert('Scan failed: ' + error.message);
        }
    };

    const handleScanComplete = () => {
        setScannedEmployee(null);
        fetchInstitutionStats(); // Refresh stats
    };

    const StatCard = ({ number, label, icon }) => (
        <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
            <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #fff, #f0f0f0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
            }}>
                {number}
            </div>
            <div style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '600',
                fontSize: '0.95rem'
            }}>
                {label}
            </div>
        </div>
    );

    // Add basic CSS styles if not available
    const styles = {
        app: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
        },
        header: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '1rem 0'
        },
        headerContent: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: 'bold'
        },
        btn: {
            padding: '0.8rem 1.5rem',
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        btnPrimary: {
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white'
        },
        btnSecondary: {
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)'
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        },
        modalContent: {
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            padding: '2rem',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
        }
    };

    if (loading) {
        return (
            <div style={styles.app}>
                <style>
                    {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    `}
                </style>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid rgba(255,255,255,0.3)',
                        borderTop: '4px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p>Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.app}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '1rem',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <div style={{ fontSize: '3rem' }}>⚠️</div>
                    <h2>Error Loading Dashboard</h2>
                    <p>{error}</p>
                    <button 
                        style={{...styles.btn, ...styles.btnPrimary}} 
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.app}>
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={styles.logo}>
                        <span>🏢</span>
                        <span>Digital Liberia Attendance</span>
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
                            {user.profile?.image && (
                                <img 
                                    src={user.profile.image} 
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
                                    color: 'white', 
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}>
                                    {user.profile?.first_name || user.profile?.firstName} {user.profile?.last_name || user.profile?.lastName}
                                </div>
                                <div style={{ 
                                    color: 'rgba(255, 255, 255, 0.7)', 
                                    fontSize: '0.8rem',
                                    fontWeight: '500'
                                }}>
                                    {user.profile?.institution_of_work || 'DIGITAL LIBERIA'} • {user.profile?.position || 'CEO'}
                                </div>
                            </div>
                        </div>
                        <button 
                            style={{...styles.btn, ...styles.btnSecondary}}
                            onClick={onLogout}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ padding: '2rem 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
                    {/* Welcome Section */}
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '25px',
                        padding: '3rem',
                        marginBottom: '3rem',
                        textAlign: 'center'
                    }}>
                        <h1 style={{ 
                            fontSize: '2.5rem', 
                            color: 'white', 
                            marginBottom: '1rem',
                            fontWeight: '900'
                        }}>
                            Welcome, {user.profile?.first_name || user.profile?.firstName || 'User'}!
                        </h1>
                        <p style={{ 
                            color: 'rgba(255,255,255,0.9)', 
                            fontSize: '1.2rem',
                            marginBottom: '2rem'
                        }}>
                            Managing attendance for {user.profile?.institution_of_work || 'DIGITAL LIBERIA'}
                        </p>
                        
                        <button 
                            onClick={startAttendanceProcess}
                            disabled={activeSession}
                            style={{ 
                                padding: '1.2rem 3rem',
                                fontSize: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                margin: '0 auto',
                                opacity: activeSession ? 0.7 : 1,
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '600',
                                cursor: activeSession ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {activeSession ? '🔄 Session Active' : '🚀 Start Attendance'}
                        </button>
                    </div>

                    {/* Statistics Section */}
                    {institutionStats && (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '2rem',
                            marginBottom: '3rem'
                        }}>
                            <StatCard 
                                number={institutionStats.total_employees || '0'} 
                                label="Total Employees" 
                                icon="👥"
                            />
                            <StatCard 
                                number={institutionStats.checked_in_today || '0'} 
                                label="Checked In Today" 
                                icon="✅"
                            />
                            <StatCard 
                                number={institutionStats.checked_out_today || '0'} 
                                label="Checked Out Today" 
                                icon="🚪"
                            />
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        padding: '2rem'
                    }}>
                        <h3 style={{ 
                            color: 'white', 
                            marginBottom: '1.5rem',
                            fontSize: '1.5rem'
                        }}>
                            Recent Attendance Records
                        </h3>
                        {recentRecords.length > 0 ? (
                            <div>
                                {recentRecords.map((record, index) => (
                                    <div key={record.id || index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '12px',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{ fontSize: '1.5rem' }}>
                                            {record.attendance_type === 'check_in' ? '✅' : '🚪'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: 'white', fontWeight: '600' }}>
                                                {record.first_name} {record.last_name}
                                            </div>
                                            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                                                {new Date(record.recorded_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '0.3rem 0.8rem',
                                            background: record.status === 'completed' 
                                                ? 'rgba(34, 197, 94, 0.2)' 
                                                : 'rgba(234, 179, 8, 0.2)',
                                            color: record.status === 'completed' ? '#22c55e' : '#eab308',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }}>
                                            {record.status || 'pending'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                                No recent attendance records
                            </p>
                        )}
                    </div>
                </div>
            </main>

            {/* QR Scanner Modal */}
            {showQRScanner && (
                <div style={styles.modalOverlay} onClick={() => setShowQRScanner(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <QRCodeScanner 
                            onScan={handleQRScan}
                            onClose={() => setShowQRScanner(false)}
                            institution={user.profile?.institution_of_work || 'DIGITAL LIBERIA'}
                        />
                    </div>
                </div>
            )}

            {/* Scanned Employee Modal */}
            {scannedEmployee && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'white' }}>
                            Employee Verified ✅
                        </h3>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            {scannedEmployee.imageUrl && (
                                <img 
                                    src={scannedEmployee.imageUrl} 
                                    alt={scannedEmployee.firstName}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        marginBottom: '1rem',
                                        border: '3px solid #22c55e'
                                    }}
                                />
                            )}
                            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>
                                {scannedEmployee.firstName} {scannedEmployee.lastName}
                            </h4>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {scannedEmployee.position}
                            </p>
                            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                DSSN: {scannedEmployee.dssn}
                            </p>
                        </div>
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '12px',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            textAlign: 'center'
                        }}>
                            <p style={{ color: '#22c55e', margin: 0 }}>
                                📱 Push notification sent for digital signature
                            </p>
                        </div>
                        <button 
                            style={{...styles.btn, ...styles.btnPrimary, width: '100%'}}
                            onClick={handleScanComplete}
                        >
                            Continue Scanning
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
