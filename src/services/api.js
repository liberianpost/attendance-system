// src/services/api.js
const API_BASE = 'https://libpayapp.liberianpost.com:8081';

export const api = {
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

// Attendance specific API calls
export const attendanceAPI = {
  recordAttendance: async (attendanceData) => {
    return api.post('/attendance/record', attendanceData);
  },
  
  getInstitutionAttendance: async (institutionId, date) => {
    return api.get(`/attendance/institution/${institutionId}?date=${date}`);
  },
  
  getUserAttendance: async (dssn) => {
    return api.get(`/attendance/user/${dssn}`);
  },
  
  getInstitutions: async () => {
    return api.get('/institutions');
  }
};
