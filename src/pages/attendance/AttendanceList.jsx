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
      const data = await attendanceService.getMyAttendance();
      setAttendance(data);
    } catch (err) {
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
              <th>Check Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record._id}>
                <td>{formatDate(record.date)}</td>
                <td>{record.checkIn || 'N/A'}</td>
                <td>{record.checkOut || 'N/A'}</td>
                <td>
                  <span className={`status-badge status-${record.status.toLowerCase()}`}>
                    {record.status}
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
