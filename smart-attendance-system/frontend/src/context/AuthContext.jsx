import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Axios defaults
    axios.defaults.baseURL = 'https://demo-6g4k.onrender.com/api';

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    const res = await axios.get('/auth');
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            } else {
                delete axios.defaults.headers.common['x-auth-token'];
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            return true;
        } catch (err) {
            console.error(err.response?.data?.msg || 'Login failed');
            return false;
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const res = await axios.post('/auth/register', { name, email, password, role });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            return true;
        } catch (err) {
            console.error(err.response?.data?.msg || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};