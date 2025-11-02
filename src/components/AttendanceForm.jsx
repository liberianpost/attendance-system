import React, { useState } from 'react';
import QRScanner from './QRScanner.jsx';

const AttendanceForm = ({ institution }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [attendanceType, setAttendanceType] = useState('check-in');

  const handleScan = async (dssn) => {
    setShowScanner(false);
    setLoading(true);
    setMessage('');

    try {
      // Mock API call
      setTimeout(() => {
        setMessage(`✅ ${attendanceType === 'check-in' ? 'Check-in' : 'Check-out'} recorded successfully for ${dssn}`);
        setLoading(false);
      }, 1500);
    } catch (error) {
      setMessage(`❌ Error recording attendance: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="attendance-form">
      <div className="form-header">
        <h3>Record Attendance - {institution.name}</h3>
        <p>Scan DSSN QR code to record {attendanceType}</p>
      </div>

      <div className="attendance-type-selector">
        <label>
          <input
            type="radio"
            value="check-in"
            checked={attendanceType === 'check-in'}
            onChange={(e) => setAttendanceType(e.target.value)}
          />
          Check-in
        </label>
        <label>
          <input
            type="radio"
            value="check-out"
            checked={attendanceType === 'check-out'}
            onChange={(e) => setAttendanceType(e.target.value)}
          />
          Check-out
        </label>
      </div>

      <button 
        onClick={() => setShowScanner(true)}
        disabled={loading}
        className="scan-btn primary-btn"
      >
        {loading ? 'Processing...' : `Scan DSSN for ${attendanceType}`}
      </button>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          mode="attendance"
        />
      )}
    </div>
  );
};

export default AttendanceForm;
