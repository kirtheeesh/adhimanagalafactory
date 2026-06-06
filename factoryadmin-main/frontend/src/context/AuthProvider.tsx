import React, { useState, useEffect } from 'react';
import { AuthContext, type User } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('admin_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('admin_token');
    });

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    };

    useEffect(() => {
        const handleUnauthorized = () => {
            logout();
        };

        window.addEventListener('admin-unauthorized', handleUnauthorized);
        return () => window.removeEventListener('admin-unauthorized', handleUnauthorized);
    }, []);

    const setAuth = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('admin_token', newToken);
        localStorage.setItem('admin_user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, setAuth, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
