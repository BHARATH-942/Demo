import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const success = await register(formData.name, formData.email, formData.password, formData.role);
        if (!success) {
            setError('Registration failed. Email might already exist.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-72px)] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-blue-600 mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
                        <UserPlus size={32} />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Create an account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <div className="mt-1">
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1">
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <div className="mt-1">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="student">Student</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
                            >
                                {loading ? 'Creating...' : 'Sign up'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
