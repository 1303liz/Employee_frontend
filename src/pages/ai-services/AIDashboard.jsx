import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AIDashboard.css';

const AIDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        attendancePredictions: [],
        moodAnalyses: [],
        leaveRecommendations: []
    });
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        loadEmployees();
        loadDashboardData();
    }, []);

    const loadEmployees = async () => {
        try {
            const response = await api.get('/employee-management/employees/');
            setEmployees(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to load employees:', error);
        }
    };

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [attendanceRes, moodRes, leaveRes] = await Promise.all([
                api.get('/ai-services/attendance/dashboard/'),
                api.get('/ai-services/mood/dashboard/'),
                api.get('/ai-services/leave/dashboard/')
            ]);

            setData({
                attendancePredictions: attendanceRes.data,
                moodAnalyses: moodRes.data,
                leaveRecommendations: leaveRes.data
            });
        } catch (error) {
            console.error('Failed to load AI dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAttendancePrediction = async (employeeId) => {
        try {
            setLoading(true);
            const response = await api.post('/ai-services/attendance/predict/', {
                employee_id: employeeId
            });
            alert('Attendance prediction generated successfully!');
            loadDashboardData();
        } catch (error) {
            console.error('Failed to generate prediction:', error);
            alert('Failed to generate attendance prediction.');
        } finally {
            setLoading(false);
        }
    };

    const analyzeMood = async (employeeId) => {
        try {
            setLoading(true);
            const response = await api.post('/ai-services/mood/analyze/', {
                employee_id: employeeId
            });
            alert('Mood analysis completed successfully!');
            loadDashboardData();
        } catch (error) {
            console.error('Failed to analyze mood:', error);
            alert('Failed to analyze employee mood.');
        } finally {
            setLoading(false);
        }
    };

    const generateLeaveRecommendation = async (employeeId) => {
        try {
            setLoading(true);
            const response = await api.post('/ai-services/leave/recommend/', {
                employee_id: employeeId
            });
            alert('Leave recommendations generated successfully!');
            loadDashboardData();
        } catch (error) {
            console.error('Failed to generate recommendations:', error);
            alert('Failed to generate leave recommendations.');
        } finally {
            setLoading(false);
        }
    };

    const runComprehensiveAnalysis = async () => {
        try {
            setLoading(true);
            const response = await api.post('/ai-services/analysis/comprehensive/');
            alert('Comprehensive AI analysis completed!');
            loadDashboardData();
        } catch (error) {
            console.error('Failed to run comprehensive analysis:', error);
            alert('Failed to run comprehensive analysis.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskBadgeClass = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'high': return 'risk-badge risk-high';
            case 'medium': return 'risk-badge risk-medium';
            case 'low': return 'risk-badge risk-low';
            default: return 'risk-badge';
        }
    };

    const getMoodBadgeClass = (mood) => {
        switch (mood?.toLowerCase()) {
            case 'very_positive': return 'mood-badge mood-very-positive';
            case 'positive': return 'mood-badge mood-positive';
            case 'neutral': return 'mood-badge mood-neutral';
            case 'negative': return 'mood-badge mood-negative';
            case 'very_negative': return 'mood-badge mood-very-negative';
            default: return 'mood-badge';
        }
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return 'priority-badge priority-urgent';
            case 'high': return 'priority-badge priority-high';
            case 'medium': return 'priority-badge priority-medium';
            case 'low': return 'priority-badge priority-low';
            default: return 'priority-badge';
        }
    };

    if (loading) {
        return <div className="ai-dashboard-loading">Loading AI Dashboard...</div>;
    }

    return (
        <div className="ai-dashboard">
            <div className="ai-dashboard-header">
                <h1>🤖 AI Services Dashboard</h1>
                <p>Intelligent insights for employee management</p>
            </div>

            <div className="ai-controls">
                <div className="employee-selector">
                    <select 
                        value={selectedEmployee || ''} 
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="employee-select"
                    >
                        <option value="">Select an employee for analysis</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name} ({emp.username})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedEmployee && (
                    <div className="ai-action-buttons">
                        <button 
                            onClick={() => generateAttendancePrediction(selectedEmployee)}
                            className="ai-btn ai-btn-attendance"
                            disabled={loading}
                        >
                            🎯 Predict Attendance
                        </button>
                        <button 
                            onClick={() => analyzeMood(selectedEmployee)}
                            className="ai-btn ai-btn-mood"
                            disabled={loading}
                        >
                            😊 Analyze Mood
                        </button>
                        <button 
                            onClick={() => generateLeaveRecommendation(selectedEmployee)}
                            className="ai-btn ai-btn-leave"
                            disabled={loading}
                        >
                            📅 Recommend Leave
                        </button>
                    </div>
                )}

                <div className="global-actions">
                    <button 
                        onClick={runComprehensiveAnalysis}
                        className="ai-btn ai-btn-comprehensive"
                        disabled={loading}
                    >
                        🚀 Run Full Analysis
                    </button>
                    <button 
                        onClick={loadDashboardData}
                        className="ai-btn ai-btn-refresh"
                        disabled={loading}
                    >
                        🔄 Refresh Data
                    </button>
                </div>
            </div>

            <div className="ai-insights-grid">
                {/* Attendance Predictions */}
                <div className="ai-insight-card">
                    <div className="card-header">
                        <h3>🎯 Attendance Predictions</h3>
                        <span className="card-stats">
                            High Risk: {data.attendancePredictions.high_risk || 0}
                        </span>
                    </div>
                    <div className="card-content">
                        {data.attendancePredictions.high_risk_employees?.length > 0 ? (
                            data.attendancePredictions.high_risk_employees.slice(0, 5).map((pred, idx) => (
                                <div key={idx} className="insight-item">
                                    <div className="insight-info">
                                        <strong>{pred.employee_name}</strong>
                                        <div className="insight-meta">
                                            Date: {pred.prediction_date}
                                            | Confidence: {(pred.model_confidence * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <span className={getRiskBadgeClass(pred.absence_risk)}>
                                        {pred.absence_risk}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No high-risk predictions found</p>
                        )}
                    </div>
                </div>

                {/* Mood Analysis */}
                <div className="ai-insight-card">
                    <div className="card-header">
                        <h3>😊 Mood Analysis</h3>
                        <span className="card-stats">
                            Needs Attention: {data.moodAnalyses.requires_attention || 0}
                        </span>
                    </div>
                    <div className="card-content">
                        {data.moodAnalyses.attention_employees?.length > 0 ? (
                            data.moodAnalyses.attention_employees.slice(0, 5).map((analysis, idx) => (
                                <div key={idx} className="insight-item">
                                    <div className="insight-info">
                                        <strong>{analysis.employee_name}</strong>
                                        <div className="insight-meta">
                                            Score: {analysis.mood_score?.toFixed(2)} 
                                            | {analysis.attention_reason}
                                        </div>
                                    </div>
                                    <span className={getMoodBadgeClass(analysis.mood_category)}>
                                        {analysis.mood_category?.replace('_', ' ')}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No employees requiring attention</p>
                        )}
                    </div>
                </div>

                {/* Leave Recommendations */}
                <div className="ai-insight-card">
                    <div className="card-header">
                        <h3>📅 Leave Recommendations</h3>
                        <span className="card-stats">
                            Urgent: {data.leaveRecommendations.urgent_count || 0}
                        </span>
                    </div>
                    <div className="card-content">
                        {data.leaveRecommendations.high_priority?.length > 0 ? (
                            data.leaveRecommendations.high_priority.slice(0, 5).map((rec, idx) => (
                                <div key={idx} className="insight-item">
                                    <div className="insight-info">
                                        <strong>{rec.employee_name}</strong>
                                        <div className="insight-meta">
                                            {rec.recommendation_type?.replace('_', ' ')} 
                                            | {rec.recommended_duration} days
                                            | Start: {rec.recommended_start_date}
                                        </div>
                                    </div>
                                    <span className={getPriorityBadgeClass(rec.priority)}>
                                        {rec.priority}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No urgent recommendations</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="ai-stats-summary">
                <div className="stat-item">
                    <div className="stat-value">
                        {data.attendancePredictions.statistics?.total_predictions || 0}
                    </div>
                    <div className="stat-label">Total Predictions</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">
                        {data.moodAnalyses.statistics?.total_analyses || 0}
                    </div>
                    <div className="stat-label">Mood Analyses</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">
                        {data.leaveRecommendations.statistics?.total_recommendations || 0}
                    </div>
                    <div className="stat-label">Leave Recommendations</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">
                        {((data.attendancePredictions.average_attendance_probability || 0) * 100).toFixed(1)}%
                    </div>
                    <div className="stat-label">Avg Attendance Probability</div>
                </div>
            </div>
        </div>
    );
};

export default AIDashboard;