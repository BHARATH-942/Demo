import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const API = "https://demo-6g4k.onrender.com/api";

    // Load logged-in user (IMPORTANT FIX: no /api/auth call anymore)
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await axios.get(`${API}/auth/me`, {
                        headers: {
                            'x-auth-token': token
                        }
                    });

                    setUser(res.data.user);
                } catch (err) {
                    console.log("Session expired or invalid token");
                    logout();
                }
            }

            setLoading(false);
        };

        loadUser();
    }, [token]);

    // LOGIN
    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API}/auth/login`, {
                email,
                password
            });

            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);

            return true;
        } catch (err) {
            console.log(err.response?.data?.msg || "Login failed");
            return false;
        }
    };

    // REGISTER
    const register = async (name, email, password, role) => {
        try {
            const res = await axios.post(`${API}/auth/register`, {
                name,
                email,
                password,
                role
            });

            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);

            return true;
        } catch (err) {
            console.log(err.response?.data?.msg || "Registration failed");
            return false;
        }
    };

    // LOGOUT
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};