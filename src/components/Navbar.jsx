import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center transition-all">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">SA</span>
                </div>
                <Link to="/" className="text-xl font-bold text-gray-800 tracking-tight">Smart Attend</Link>
            </div>

            <div className="hidden md:flex space-x-6 items-center">
                {user ? (
                    <>
                        <Link
                            to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                            className="text-gray-600 hover:text-blue-600 font-medium transition"
                        >
                            Dashboard
                        </Link>
                        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full">
                            <User size={16} className="text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700 capitalize">{user.name}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{user.role}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                        >
                            <LogOut size={18} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">Login</Link>
                        <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition">Sign Up</Link>
                    </>
                )}
            </div>

            <div className="md:hidden flex items-center">
                <button className="text-gray-600 hover:text-gray-900">
                    <Menu size={24} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
