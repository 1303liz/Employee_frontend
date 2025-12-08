import React, { useState, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';

const AttendanceList = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceService.getMyAttendance();
      console.log('Fetched attendance response:', response);
      
      // Handle both paginated and direct array responses
      const data = Array.isArray(response) ? response : (response.results || []);
      
      setAttendance(data);
    } catch (err) {
      console.error('Failed to load attendance:', err);
      setError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="attendance-list-container">
      <h1>My Attendance</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check In Location</th>
              <th>Check Out</th>
              <th>Check Out Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id}>
                <td>{formatDate(record.date)}</td>
                <td>
                  {record.check_in_time ? (
                    <div>
                      <div>{new Date(record.check_in_time).toLocaleTimeString()}</div>
                    </div>
                  ) : 'N/A'}
                </td>
                <td>
                  {record.check_in_location ? (
                    <div className="location-text" title={record.check_in_location}>
                      📍 {record.check_in_location.length > 50 
                        ? record.check_in_location.substring(0, 50) + '...' 
                        : record.check_in_location}
                    </div>
                  ) : '-'}
                </td>
                <td>
                  {record.check_out_time ? (
                    <div>
                      <div>{new Date(record.check_out_time).toLocaleTimeString()}</div>
                    </div>
                  ) : 'N/A'}
                </td>
                <td>
                  {record.check_out_location ? (
                    <div className="location-text" title={record.check_out_location}>
                      📍 {record.check_out_location.length > 50 
                        ? record.check_out_location.substring(0, 50) + '...' 
                        : record.check_out_location}
                    </div>
                  ) : '-'}
                </td>
                <td>
                  <span className={`status-badge status-${(record.status || 'present').toLowerCase()}`}>
                    {record.status || 'Present'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {attendance.length === 0 && <p className="no-data">No attendance records found.</p>}
    </div>
  );
};

export default AttendanceList;
