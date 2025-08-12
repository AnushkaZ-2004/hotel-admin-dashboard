// src/components/Layout/Layout.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="layout">
            <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
            <div className="main-content">
                <Topbar onToggleSidebar={toggleSidebar} />
                <div className="content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;