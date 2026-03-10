import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Alert, Spin, Button, Table, Tag, Modal, Progress, Statistic } from 'antd';
import { 
    RobotOutlined, 
    HeartOutlined, 
    CalendarOutlined,
    TrophyOutlined,
    AlertOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { aiServicesAPI } from '../../services/aiServicesAPI';

const { TabPane } = Tabs;
const { Meta } = Card;

const AIServicesDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [overviewData, setOverviewData] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);
    const [moodData, setMoodData] = useState(null);
    const [leaveData, setLeaveData] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [overview, attendance, mood, leave] = await Promise.all([
                aiServicesAPI.getOverview(),
                aiServicesAPI.getAttendanceDashboard(),
                aiServicesAPI.getMoodDashboard(),
                aiServicesAPI.getLeaveDashboard()
            ]);

            setOverviewData(overview);
            setAttendanceData(attendance);
            setMoodData(mood);
            setLeaveData(leave);
        } catch (error) {
            console.error('Error loading AI services data:', error);
        } finally {
            setLoading(false);
        }
    };

    const runComprehensiveAnalysis = async (employeeId = null) => {
        setLoading(true);
        try {
            if (employeeId) {
                await aiServicesAPI.runComprehensiveAnalysis(employeeId);
            } else {
                await aiServicesAPI.runDailyAnalysisAll();
            }
            await loadAllData();
        } catch (error) {
            console.error('Error running analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    const showEmployeeDetails = (employee) => {
        setSelectedEmployee(employee);
        setModalVisible(true);
    };

    // Overview Cards
    const OverviewCards = () => (
        <Row gutter={[16, 16]} className=\"mb-6\">
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title=\"Tomorrow's Predictions\"
                        value={overviewData?.attendance_predictions?.total_predictions_tomorrow || 0}
                        prefix={<RobotOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title=\"Recent Mood Analyses\"
                        value={overviewData?.mood_analysis?.recent_analyses || 0}
                        prefix={<HeartOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title=\"Attention Required\"
                        value={overviewData?.mood_analysis?.attention_required || 0}
                        prefix={<AlertOutlined />}
                        valueStyle={{ color: '#faad14' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card>
                    <Statistic
                        title=\"Urgent Leave Recommendations\"
                        value={overviewData?.leave_recommendations?.urgent_recommendations || 0}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: '#ff4d4f' }}
                    />
                </Card>
            </Col>
        </Row>
    );

    // Attendance Prediction Tab
    const AttendancePredictionContent = () => {
        const columns = [
            {
                title: 'Employee',
                dataIndex: 'employee_name',
                key: 'employee_name',
                render: (name, record) => (
                    <Button 
                        type=\"link\" 
                        onClick={() => showEmployeeDetails(record)}
                    >
                        {name || record.employee_username}
                    </Button>
                )
            },
            {
                title: 'Attendance Probability',
                dataIndex: 'attendance_probability',
                key: 'attendance_probability',
                render: (prob) => (
                    <Progress 
                        percent={(prob * 100).toFixed(0)} 
                        size=\"small\"
                        status={prob < 0.5 ? 'exception' : prob < 0.7 ? 'active' : 'success'}
                    />
                )
            },
            {
                title: 'Risk Level',
                dataIndex: 'absence_risk',
                key: 'absence_risk',
                render: (risk) => {
                    const color = {
                        'LOW': 'green',
                        'MEDIUM': 'orange',
                        'HIGH': 'red',
                        'CRITICAL': 'purple'
                    }[risk];
                    return <Tag color={color}>{risk}</Tag>;
                }
            },
            {
                title: 'Confidence',
                dataIndex: 'model_confidence',
                key: 'model_confidence',
                render: (confidence) => `${(confidence * 100).toFixed(0)}%`
            }
        ];

        return (
            <div>
                <div className=\"mb-4 flex justify-between items-center\">
                    <div>
                        <h3>Tomorrow's Attendance Predictions</h3>
                        <p className=\"text-gray-600\">AI predictions for {attendanceData?.date}</p>
                    </div>
                    <Button 
                        type=\"primary\" 
                        icon={<ReloadOutlined />}
                        onClick={() => runComprehensiveAnalysis()}
                        loading={loading}
                    >
                        Refresh Analysis
                    </Button>
                </div>

                <Row gutter={[16, 16]} className=\"mb-4\">
                    <Col span={6}>
                        <Card>
                            <Statistic 
                                title=\"Total Predictions\" 
                                value={attendanceData?.statistics?.total_predictions || 0} 
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic 
                                title=\"High Risk\" 
                                value={attendanceData?.statistics?.high_risk || 0}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic 
                                title=\"Medium Risk\" 
                                value={attendanceData?.statistics?.medium_risk || 0}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic 
                                title=\"Low Risk\" 
                                value={attendanceData?.statistics?.low_risk || 0}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <Table 
                        columns={columns}
                        dataSource={attendanceData?.high_risk_employees || []}
                        rowKey=\"id\"
                        pagination={{ pageSize: 10 }}
                        title={() => \"High Risk Employees\"}
                    />
                </Card>
            </div>
        );
    };

    // Mood Analysis Tab
    const MoodAnalysisContent = () => {
        const columns = [
            {
                title: 'Employee',
                dataIndex: 'employee_name',
                key: 'employee_name',
                render: (name, record) => (
                    <Button 
                        type=\"link\" 
                        onClick={() => showEmployeeDetails(record)}
                    >
                        {name || record.employee_username}
                    </Button>
                )
            },
            {
                title: 'Mood Score',
                dataIndex: 'mood_score',
                key: 'mood_score',
                render: (score) => (
                    <Progress 
                        percent={((score + 1) * 50).toFixed(0)}
                        size=\"small\"
                        status={score < -0.3 ? 'exception' : score < 0.3 ? 'active' : 'success'}
                    />
                )
            },
            {
                title: 'Category',
                dataIndex: 'mood_category',
                key: 'mood_category',
                render: (category) => {
                    const color = {
                        'VERY_POSITIVE': 'green',
                        'POSITIVE': 'blue',
                        'NEUTRAL': 'default',
                        'NEGATIVE': 'orange',
                        'VERY_NEGATIVE': 'red'
                    }[category];
                    return <Tag color={color}>{category.replace('_', ' ')}</Tag>;
                }
            },
            {
                title: 'Stress Level',
                dataIndex: 'stress_level',
                key: 'stress_level',
                render: (stress) => (
                    <Progress 
                        percent={(stress * 100).toFixed(0)}
                        size=\"small\"
                        status={stress > 0.7 ? 'exception' : stress > 0.4 ? 'active' : 'success'}
                    />
                )
            },
            {
                title: 'Needs Attention',
                dataIndex: 'requires_attention',
                key: 'requires_attention',
                render: (attention) => attention ? 
                    <Tag color=\"red\">YES</Tag> : 
                    <Tag color=\"green\">NO</Tag>
            }
        ];

        return (
            <div>
                <div className=\"mb-4\">
                    <h3>Employee Mood Analysis</h3>
                    <p className=\"text-gray-600\">Last 30 days analysis</p>
                </div>

                <Row gutter={[16, 16]} className=\"mb-4\">
                    <Col span={8}>
                        <Card>
                            <Statistic 
                                title=\"Total Analyses\" 
                                value={moodData?.statistics?.total_analyses || 0} 
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic 
                                title=\"Requires Attention\" 
                                value={moodData?.statistics?.requires_attention || 0}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic 
                                title=\"Attention Rate\" 
                                value={moodData?.statistics?.attention_percentage?.toFixed(1) || 0}
                                suffix=\"%\"
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <Table 
                        columns={columns}
                        dataSource={moodData?.attention_employees || []}
                        rowKey=\"id\"
                        pagination={{ pageSize: 10 }}
                        title={() => \"Employees Requiring Attention\"}
                    />
                </Card>
            </div>
        );
    };

    // Leave Recommendations Tab
    const LeaveRecommendationsContent = () => {
        const columns = [
            {
                title: 'Employee',
                dataIndex: 'employee_name',
                key: 'employee_name',
                render: (name, record) => (
                    <Button 
                        type=\"link\" 
                        onClick={() => showEmployeeDetails(record)}
                    >
                        {name || record.employee_username}
                    </Button>
                )
            },
            {
                title: 'Type',
                dataIndex: 'recommendation_type',
                key: 'recommendation_type',
                render: (type) => <Tag>{type.replace('_', ' ')}</Tag>
            },
            {
                title: 'Priority',
                dataIndex: 'priority',
                key: 'priority',
                render: (priority) => {
                    const color = {
                        'LOW': 'default',
                        'MEDIUM': 'blue',
                        'HIGH': 'orange',
                        'URGENT': 'red'
                    }[priority];
                    return <Tag color={color}>{priority}</Tag>;
                }
            },
            {
                title: 'Recommended Dates',
                key: 'dates',
                render: (record) => (
                    `${record.recommended_start_date} to ${record.recommended_end_date}`
                )
            },
            {
                title: 'Duration',
                dataIndex: 'recommended_duration',
                key: 'recommended_duration',
                render: (duration) => `${duration} days`
            },
            {
                title: 'Burnout Risk',
                dataIndex: 'burnout_risk_score',
                key: 'burnout_risk_score',
                render: (risk) => (
                    <Progress 
                        percent={(risk * 100).toFixed(0)}
                        size=\"small\"
                        status={risk > 0.7 ? 'exception' : risk > 0.4 ? 'active' : 'success'}
                    />
                )
            }
        ];

        return (
            <div>
                <div className=\"mb-4\">
                    <h3>Smart Leave Recommendations</h3>
                    <p className=\"text-gray-600\">AI-generated leave suggestions</p>
                </div>

                <Row gutter={[16, 16]} className=\"mb-4\">
                    <Col span={8}>
                        <Card>
                            <Statistic 
                                title=\"Active Recommendations\" 
                                value={leaveData?.statistics?.total_recommendations || 0} 
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic 
                                title=\"Urgent\" 
                                value={leaveData?.statistics?.urgent_count || 0}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic 
                                title=\"High Priority\" 
                                value={leaveData?.statistics?.high_count || 0}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <Table 
                        columns={columns}
                        dataSource={leaveData?.high_priority_recommendations || []}
                        rowKey=\"id\"
                        pagination={{ pageSize: 10 }}
                        title={() => \"High Priority Recommendations\"}
                    />
                </Card>
            </div>
        );
    };

    if (loading && !overviewData) {
        return (
            <div className=\"flex justify-center items-center\" style={{ minHeight: '400px' }}>
                <Spin size=\"large\" />
            </div>
        );
    }

    return (
        <div className=\"ai-services-dashboard p-6\">
            <div className=\"mb-6\">
                <h1 className=\"text-2xl font-bold mb-2\">AI Services Dashboard</h1>
                <p className=\"text-gray-600\">
                    Intelligent insights into employee attendance, mood, and leave patterns
                </p>
            </div>

            {overviewData && <OverviewCards />}

            <Card>
                <Tabs defaultActiveKey=\"attendance\" size=\"large\">
                    <TabPane 
                        tab={
                            <span>
                                <RobotOutlined />
                                Attendance Prediction
                            </span>
                        } 
                        key=\"attendance\"
                    >
                        <AttendancePredictionContent />
                    </TabPane>
                    
                    <TabPane 
                        tab={
                            <span>
                                <HeartOutlined />
                                Mood Analysis
                            </span>
                        } 
                        key=\"mood\"
                    >
                        <MoodAnalysisContent />
                    </TabPane>
                    
                    <TabPane 
                        tab={
                            <span>
                                <CalendarOutlined />
                                Leave Recommendations
                            </span>
                        } 
                        key=\"leave\"
                    >
                        <LeaveRecommendationsContent />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Employee Details Modal */}
            <Modal
                title={`Employee Details: ${selectedEmployee?.employee_name || selectedEmployee?.employee_username}`}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key=\"close\" onClick={() => setModalVisible(false)}>
                        Close
                    </Button>,
                    <Button 
                        key=\"analyze\" 
                        type=\"primary\" 
                        onClick={() => {
                            runComprehensiveAnalysis(selectedEmployee?.employee);
                            setModalVisible(false);
                        }}
                    >
                        Run Analysis
                    </Button>
                ]}
                width={800}
            >
                {selectedEmployee && (
                    <div>
                        <Alert
                            message=\"AI Analysis Results\"
                            description={`Detailed analysis for ${selectedEmployee.employee_name || selectedEmployee.employee_username}`}
                            type=\"info\"
                            showIcon
                            className=\"mb-4\"
                        />
                        {/* Add more detailed employee information here */}
                        <pre>{JSON.stringify(selectedEmployee, null, 2)}</pre>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AIServicesDashboard;