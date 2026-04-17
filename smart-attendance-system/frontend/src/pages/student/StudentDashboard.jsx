import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FileClock, MapPin, ScanFace, CheckCircle2, AlertCircle } from 'lucide-react';

const StudentDashboard = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('/attendance');
                setHistory(res.data);
            } catch (err) {
                console.error('Failed to fetch history', err);
            }
            setLoading(false);
        };
        fetchHistory();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Student Dashboard</h1>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Mark Attendance</h2>
                        <p className="text-gray-500 mb-4 text-sm">Join an active class session</p>
                        <Link to="/student/mark-attendance" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow transition">
                            Mark Present
                        </Link>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <MapPin size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Setup Face ID</h2>
                        <p className="text-gray-500 mb-4 text-sm">Register your face descriptor</p>
                        <Link to="/student/face-setup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow transition">
                            Configure
                        </Link>
                    </div>
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                        <ScanFace size={32} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center space-x-2">
                    <FileClock className="text-gray-500" />
                    <h3 className="text-xl font-bold text-gray-800">Recent Attendance</h3>
                </div>
                {loading ? (
                    <div className="p-10 text-center text-gray-500">Loading history...</div>
                ) : history.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No attendance records found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm">
                                <tr>
                                    <th className="px-6 py-3">Subject</th>
                                    <th className="px-6 py-3">Session Code</th>
                                    <th className="px-6 py-3">Date & Time</th>
                                    <th className="px-6 py-3">Location Verified</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium text-gray-800">{record.classSession?.subject}</td>
                                        <td className="px-6 py-4 text-gray-500">{record.classSession?.classCode}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(record.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {record.locationMatched ?
                                                <span className="inline-flex items-center text-green-600 text-sm"><CheckCircle2 size={16} className="mr-1" /> Yes</span> :
                                                <span className="inline-flex items-center text-red-600 text-sm"><AlertCircle size={16} className="mr-1" /> No</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
