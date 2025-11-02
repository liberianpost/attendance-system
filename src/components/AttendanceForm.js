// src/components/AttendanceForm.js
import React, { useState } from 'react';
import QRScanner from './QRScanner';
import { attendanceAPI } from '../services/api';
import { useAuth } from '../services/auth';

const AttendanceForm = ({ institution }) => {
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [attendanceType, setAttendanceType] = useState('check-in');
  const { user } = useAuth();

  const handleScan = async (dssn) => {
    setShowScanner(false);
    setLoading(true);
    setMessage('');

    try {
      const attendanceData = {
        dssn: dssn,
        institutionId: institution.id,
        attendanceType: attendanceType,
        recordedBy: user.dssn,
        timestamp: new Date().toISOString(),
        location: await getCurrentLocation()
      };

      const result = await attendanceAPI.recordAttendance(attendanceData);
      
      if (result.success) {
        setMessage(`✅ ${attendanceType === 'check-in' ? 'Check-in' : 'Check-out'} recorded successfully for ${dssn}`);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error recording attendance: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          resolve({ latitude: null, longitude: null });
        },
        { timeout: 5000 }
      );
    });
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
