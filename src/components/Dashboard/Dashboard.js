// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { hotelService, roomService, bookingService } from '../../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalHotels: 0,
        totalRooms: 0,
        totalBookings: 0,
        activeBookings: 0,
        availableRooms: 0,
        occupiedRooms: 0,
        revenue: 0,
        occupancyRate: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [hotels, rooms, bookings] = await Promise.all([
                hotelService.getAll(),
                roomService.getAll(),
                bookingService.getAll()
            ]);

            // Calculate stats
            const activeBookings = bookings.filter(b =>
                ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(b.bookingStatus)
            );

            const availableRooms = rooms.filter(r => r.status === 'AVAILABLE');
            const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED');

            const revenue = bookings
                .filter(b => b.paymentStatus === 'PAID')
                .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0);

            const occupancyRate = rooms.length > 0 ?
                ((occupiedRooms.length / rooms.length) * 100).toFixed(1) : 0;

            setStats({
                totalHotels: hotels.length,
                totalRooms: rooms.length,
                totalBookings: bookings.length,
                activeBookings: activeBookings.length,
                availableRooms: availableRooms.length,
                occupiedRooms: occupiedRooms.length,
                revenue: revenue,
                occupancyRate: occupancyRate
            });

            // Get recent bookings
            const recent = bookings
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            setRecentBookings(recent);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, subtitle, icon, trend, color = 'blue' }) => (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-header">
                <div className="stat-content">
                    <div className="stat-value">{value}</div>
                    <div className="stat-title">{title}</div>
                    {subtitle && <div className="stat-subtitle">{subtitle}</div>}
                    {trend && (
                        <div className={`stat-trend ${trend.type}`}>
                            <span className="trend-icon">
                                {trend.type === 'up' ? '📈' : trend.type === 'down' ? '📉' : '📊'}
                            </span>
                            {trend.value}
                        </div>
                    )}
                </div>
                <div className="stat-icon">{icon}</div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
                <button className="btn btn-primary" onClick={loadDashboardData}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Welcome Section */}
            <div className="dashboard-welcome">
                <h2>Welcome back! 👋</h2>
                <p>Here's what's happening at your hotels today.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    title="Total Hotels"
                    value={stats.totalHotels}
                    subtitle="Active properties"
                    icon="🏨"
                    color="blue"
                    trend={{ type: 'up', value: '+2 this month' }}
                />
                <StatCard
                    title="Total Rooms"
                    value={stats.totalRooms}
                    subtitle={`${stats.availableRooms} available`}
                    icon="🛏️"
                    color="green"
                />
                <StatCard
                    title="Active Bookings"
                    value={stats.activeBookings}
                    subtitle={`of ${stats.totalBookings} total`}
                    icon="📋"
                    color="orange"
                />
                <StatCard
                    title="Occupancy Rate"
                    value={`${stats.occupancyRate}%`}
                    subtitle={`${stats.occupiedRooms} occupied rooms`}
                    icon="📊"
                    color="purple"
                    trend={{ type: 'up', value: '+5.2%' }}
                />
            </div>

            {/* Charts and Recent Activity */}
            <div className="dashboard-grid">
                {/* Recent Bookings */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Recent Bookings</h3>
                        <span className="card-subtitle">Latest reservation activity</span>
                    </div>
                    <div className="card-content">
                        {recentBookings.length > 0 ? (
                            <div className="recent-bookings">
                                {recentBookings.map(booking => (
                                    <div key={booking.id} className="booking-item">
                                        <div className="booking-info">
                                            <div className="booking-id">#{booking.id}</div>
                                            <div className="booking-details">
                                                <span>User {booking.userId}</span>
                                                <span className="separator">•</span>
                                                <span>Hotel {booking.hotelId}</span>
                                                <span className="separator">•</span>
                                                <span>{booking.checkInDate}</span>
                                            </div>
                                        </div>
                                        <div className="booking-status">
                                            <span className={`status-badge status-${booking.bookingStatus.toLowerCase()}`}>
                                                {booking.bookingStatus}
                                            </span>
                                            <div className="booking-amount">${booking.totalAmount}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <span className="empty-icon">📋</span>
                                <p>No recent bookings</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Quick Actions</h3>
                        <span className="card-subtitle">Common tasks</span>
                    </div>
                    <div className="card-content">
                        <div className="quick-actions">
                            <button className="action-button action-primary">
                                <span className="action-icon">🏨</span>
                                <div className="action-content">
                                    <div className="action-title">Add Hotel</div>
                                    <div className="action-subtitle">Create new property</div>
                                </div>
                            </button>

                            <button className="action-button action-success">
                                <span className="action-icon">🛏️</span>
                                <div className="action-content">
                                    <div className="action-title">Add Room Type</div>
                                    <div className="action-subtitle">Define new room category</div>
                                </div>
                            </button>

                            <button className="action-button action-info">
                                <span className="action-icon">📊</span>
                                <div className="action-content">
                                    <div className="action-title">View Reports</div>
                                    <div className="action-subtitle">Analytics & insights</div>
                                </div>
                            </button>

                            <button className="action-button action-warning">
                                <span className="action-icon">👥</span>
                                <div className="action-content">
                                    <div className="action-title">Manage Staff</div>
                                    <div className="action-subtitle">Employee management</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Revenue Overview */}
                <div className="dashboard-card revenue-card">
                    <div className="card-header">
                        <h3>Revenue Overview</h3>
                        <span className="card-subtitle">Total earnings</span>
                    </div>
                    <div className="card-content">
                        <div className="revenue-display">
                            <div className="revenue-amount">${stats.revenue.toLocaleString()}</div>
                            <div className="revenue-subtitle">Total Revenue</div>
                            <div className="revenue-trend positive">
                                <span className="trend-icon">📈</span>
                                +12.5% from last month
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>System Status</h3>
                        <span className="card-subtitle">All systems operational</span>
                    </div>
                    <div className="card-content">
                        <div className="system-status">
                            <div className="status-item">
                                <div className="status-indicator online"></div>
                                <span>Booking System</span>
                                <span className="status-text">Online</span>
                            </div>
                            <div className="status-item">
                                <div className="status-indicator online"></div>
                                <span>Payment Gateway</span>
                                <span className="status-text">Online</span>
                            </div>
                            <div className="status-item">
                                <div className="status-indicator online"></div>
                                <span>Database</span>
                                <span className="status-text">Online</span>
                            </div>
                            <div className="status-item">
                                <div className="status-indicator warning"></div>
                                <span>Email Service</span>
                                <span className="status-text">Delayed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;