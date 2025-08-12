// src/components/Layout/Topbar.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/auth';

const Topbar = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const getPageTitle = () => {
        const path = location.pathname.substring(1);
        const titles = {
            'dashboard': 'Dashboard',
            'hotels': 'Hotels Management',
            'rooms': 'Rooms Management',
            'bookings': 'Bookings Management'
        };
        return titles[path] || 'Dashboard';
    };

    const getPageDescription = () => {
        const path = location.pathname.substring(1);
        const descriptions = {
            'dashboard': 'Overview of your hotel operations',
            'hotels': 'Manage your hotel properties',
            'rooms': 'Control room availability and status',
            'bookings': 'Monitor and manage reservations'
        };
        return descriptions[path] || '';
    };

    const getUserInitials = () => {
        if (!user) return 'A';
        return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'A';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="topbar">
            <div className="topbar-left">
                <button
                    className="sidebar-toggle"
                    onClick={onToggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <span className="hamburger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>

                <div className="page-info">
                    <h1 className="page-title">{getPageTitle()}</h1>
                    <p className="page-description">{getPageDescription()}</p>
                </div>
            </div>

            <div className="topbar-right">
                <div className="topbar-actions">
                    <button className="action-btn" title="Notifications">
                        <span className="action-icon">🔔</span>
                        <span className="badge">3</span>
                    </button>

                    <button className="action-btn" title="Settings">
                        <span className="action-icon">⚙️</span>
                    </button>
                </div>

                <div className="user-menu-container">
                    <button
                        className="user-menu-trigger"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <div className="user-avatar">
                            {getUserInitials()}
                        </div>
                        <div className="user-info">
                            <span className="user-name">
                                {user?.firstName} {user?.lastName}
                            </span>
                            <span className="user-role">Administrator</span>
                        </div>
                        <span className="dropdown-arrow">▼</span>
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="dropdown-header">
                                <div className="user-avatar large">
                                    {getUserInitials()}
                                </div>
                                <div>
                                    <div className="user-name">
                                        {user?.firstName} {user?.lastName}
                                    </div>
                                    <div className="user-email">{user?.email}</div>
                                </div>
                            </div>

                            <div className="dropdown-divider"></div>

                            <ul className="dropdown-menu">
                                <li>
                                    <button className="dropdown-item">
                                        <span className="item-icon">👤</span>
                                        Profile Settings
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item">
                                        <span className="item-icon">🔧</span>
                                        Account Settings
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item">
                                        <span className="item-icon">🌙</span>
                                        Dark Mode
                                    </button>
                                </li>
                            </ul>

                            <div className="dropdown-divider"></div>

                            <button
                                className="dropdown-item logout-item"
                                onClick={handleLogout}
                            >
                                <span className="item-icon">🚪</span>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {showUserMenu && (
                <div
                    className="dropdown-overlay"
                    onClick={() => setShowUserMenu(false)}
                />
            )}
        </div>
    );
};

export default Topbar;