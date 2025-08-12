// src/utils/auth.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const storedUser = localStorage.getItem('user');
        const storedAuth = localStorage.getItem('auth');

        if (storedUser && storedAuth) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);

            if (response.success && response.user.role === 'ADMIN') {
                const credentials = btoa(`${email}:${password}`);
                localStorage.setItem('auth', `Basic ${credentials}`);
                localStorage.setItem('user', JSON.stringify(response.user));
                setUser(response.user);
                return { success: true };
            } else {
                return {
                    success: false,
                    error: 'Invalid credentials or insufficient permissions'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Login failed. Please check your credentials.'
            };
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};