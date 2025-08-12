// src/components/Layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, onToggle }) => {
    const navigationItems = [
        {
            path: '/dashboard',
            label: 'Dashboard',
            icon: '📊',
            description: 'Overview & Analytics'
        },
        {
            path: '/hotels',
            label: 'Hotels',
            icon: '🏨',
            description: 'Manage Properties'
        },
        {
            path: '/rooms',
            label: 'Rooms',
            icon: '🛏️',
            description: 'Room Management'
        },
        {
            path: '/bookings',
            label: 'Bookings',
            icon: '📋',
            description: 'Reservation System'
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onToggle}
                />
            )}

            <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">🏨</div>
                        <div className="logo-text">
                            <h2>Hotel Admin</h2>
                            <span>Management System</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {navigationItems.map((item) => (
                            <li key={item.path} className="nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'nav-link-active' : ''}`
                                    }
                                    onClick={() => window.innerWidth <= 768 && onToggle()}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <div className="nav-content">
                                        <span className="nav-label">{item.label}</span>
                                        <span className="nav-description">{item.description}</span>
                                    </div>
                                    <span className="nav-arrow">›</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user-info">
                        <div className="user-status">
                            <div className="status-indicator online"></div>
                            <span>Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;