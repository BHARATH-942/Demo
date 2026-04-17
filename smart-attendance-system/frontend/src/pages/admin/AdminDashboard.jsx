import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Users, FileStack, Plus, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
    const [attendances, setAttendances] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showClassModal, setShowClassModal] = useState(false);
    const [newClass, setNewClass] = useState({ subject: '', classCode: '', radius: 100, lat: '', lng: '' });

    useEffect(() => {
        fetchData();
        // prefill location for class
        navigator.geolocation.getCurrentPosition(pos => {
            setNewClass(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        });
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [attRes, clsRes, stuRes] = await Promise.all([
                axios.get('/attendance/all'),
                axios.get('/classes'),
                axios.get('/users/students')
            ]);
            setAttendances(attRes.data);
            setClasses(clsRes.data);
            setStudents(stuRes.data);
        } catch (err) {
            console.error("Error fetching admin data", err);
        }
        setLoading(false);
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            const loc = { latitude: parseFloat(newClass.lat), longitude: parseFloat(newClass.lng) };
            await axios.post('/classes', {
                subject: newClass.subject,
                classCode: newClass.classCode.toUpperCase(),
                radius: parseInt(newClass.radius),
                location: loc
            });
            setShowClassModal(false);
            setNewClass({ ...newClass, subject: '', classCode: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error creating class');
        }
    };

    // Chart Data Preparation
    const presentCount = attendances.filter(a => a.status === 'Present').length;
    const absentCount = attendances.filter(a => a.status === 'Absent').length;

    const pieData = {
        labels: ['Present', 'Absent'],
        datasets: [{
            data: [presentCount, absentCount],
            backgroundColor: ['#22c55e', '#ef4444'],
            borderWidth: 0
        }]
    };

    // Bar chart (attendance by subject)
    const subjectMap = {};
    attendances.forEach(a => {
        const sub = a.classSession?.subject || 'Unknown';
        if (!subjectMap[sub]) { subjectMap[sub] = { present: 0 }; }
        if (a.status === 'Present') subjectMap[sub].present += 1;
    });

    const barData = {
        labels: Object.keys(subjectMap),
        datasets: [
            {
                label: 'Present Students',
                data: Object.keys(subjectMap).map(k => subjectMap[k].present),
                backgroundColor: '#3b82f6',
            }
        ]
    };

    const barOptions = { responsive: true, maintainAspectRatio: false };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <button
                    onClick={() => setShowClassModal(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow transition"
                >
                    <Plus size={20} />
                    <span>Create Session</span>
                </button>
            </div>

            {/* Top Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
                        <Users size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Students</p>
                        <h2 className="text-3xl font-bold text-gray-800">{students.length}</h2>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
                        <FileStack size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Active Sessions</p>
                        <h2 className="text-3xl font-bold text-gray-800">{classes.length}</h2>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-green-50 p-4 rounded-xl text-green-600">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Present</p>
                        <h2 className="text-3xl font-bold text-gray-800">{presentCount}</h2>
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Overall Attendance</h3>
                    <div className="h-64 flex justify-center">
                        <Pie data={pieData} />
                    </div>
                </div>
                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance by Subject</h3>
                    <div className="h-64 w-full">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Data Tables */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Active Classes Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-800">Active Sessions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Subject</th>
                                    <th className="px-6 py-3">Code</th>
                                    <th className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {classes.map(cls => (
                                    <tr key={cls._id}>
                                        <td className="px-6 py-4 font-medium text-gray-800">{cls.subject}</td>
                                        <td className="px-6 py-4 font-mono text-blue-600 font-bold">{cls.classCode}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(cls.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {classes.length === 0 && <tr><td colSpan="3" className="text-center py-4 text-gray-500">No active sessions</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Attendance Logs Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-800">Recent Logs</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Student</th>
                                    <th className="px-6 py-3">Code</th>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Loc</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {attendances.slice(0, 10).map(att => (
                                    <tr key={att._id}>
                                        <td className="px-6 py-4 font-medium text-gray-800">{att.student?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 font-mono">{att.classSession?.classCode}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="px-6 py-4">
                                            {att.locationMatched ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-500" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showClassModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800">Create Session</h3>
                            <button onClick={() => setShowClassModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        <form onSubmit={handleCreateClass} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subject Name</label>
                                <input type="text" required value={newClass.subject} onChange={e => setNewClass({ ...newClass, subject: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Session Code</label>
                                <input type="text" required value={newClass.classCode} onChange={e => setNewClass({ ...newClass, classCode: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm font-mono uppercase focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-1">
                                    <MapPin size={16} /> <span>Validation Coordinates (Lat, Lng)</span>
                                </label>
                                <div className="flex space-x-2 mt-1">
                                    <input type="text" required value={newClass.lat} onChange={e => setNewClass({ ...newClass, lat: e.target.value })} className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm" placeholder="Latitude" />
                                    <input type="text" required value={newClass.lng} onChange={e => setNewClass({ ...newClass, lng: e.target.value })} className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm" placeholder="Longitude" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Pre-filled with your current approximate location.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Radius (meters)</label>
                                <input type="number" required value={newClass.radius} onChange={e => setNewClass({ ...newClass, radius: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                                    Start Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
