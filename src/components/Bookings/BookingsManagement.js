// src/components/Bookings/BookingsManagement.js
import React, { useState, useEffect, useMemo } from 'react';
import { bookingService, hotelService } from '../../services/api';
import { useAuth } from '../../utils/auth';

const BookingsManagement = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterHotel, setFilterHotel] = useState('');
    const [filterDateRange, setFilterDateRange] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [bookingHistory, setBookingHistory] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [updatingBooking, setUpdatingBooking] = useState(null);

    const bookingStatuses = [
        { value: 'PENDING', label: 'Pending', color: 'warning' },
        { value: 'CONFIRMED', label: 'Confirmed', color: 'success' },
        { value: 'CHECKED_IN', label: 'Checked In', color: 'info' },
        { value: 'CHECKED_OUT', label: 'Checked Out', color: 'secondary' },
        { value: 'CANCELLED', label: 'Cancelled', color: 'danger' }
    ];

    const paymentStatuses = [
        { value: 'PENDING', label: 'Pending', color: 'warning' },
        { value: 'PAID', label: 'Paid', color: 'success' },
        { value: 'REFUNDED', label: 'Refunded', color: 'info' }
    ];

    useEffect(() => {
        loadData();
    }, []);

    // Clear message after 5 seconds
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [bookingsData, hotelsData] = await Promise.all([
                bookingService.getAll(),
                hotelService.getAll()
            ]);
            setBookings(bookingsData);
            setHotels(hotelsData);
        } catch (error) {
            console.error('Error loading data:', error);
            setMessage({ type: 'error', text: 'Error loading booking data. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            setUpdatingBooking(bookingId);
            await bookingService.updateStatus(
                bookingId,
                newStatus,
                user.id,
                `Status updated by admin to ${newStatus}`
            );
            setMessage({ type: 'success', text: 'Booking status updated successfully!' });
            await loadData();
        } catch (error) {
            console.error('Error updating booking status:', error);
            setMessage({ type: 'error', text: 'Error updating booking status. Please try again.' });
        } finally {
            setUpdatingBooking(null);
        }
    };

    const viewBookingHistory = async (bookingId) => {
        try {
            const history = await bookingService.getHistory(bookingId);
            setBookingHistory(history);
            setSelectedBookingId(bookingId);
            setShowHistoryModal(true);
        } catch (error) {
            console.error('Error loading booking history:', error);
            setMessage({ type: 'error', text: 'Error loading booking history. Please try again.' });
        }
    };

    const getHotelName = (hotelId) => {
        const hotel = hotels.find(h => h.id === hotelId);
        return hotel ? hotel.name : `Hotel ${hotelId}`;
    };

    const getStatusInfo = (status, statusType = 'booking') => {
        const statuses = statusType === 'booking' ? bookingStatuses : paymentStatuses;
        const statusInfo = statuses.find(s => s.value === status);
        return statusInfo || { value: status, label: status, color: 'secondary' };
    };

    const getDaysUntilCheckIn = (checkInDate) => {
        const today = new Date();
        const checkIn = new Date(checkInDate);
        const diffTime = checkIn - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const matchesStatus = !filterStatus || booking.bookingStatus === filterStatus;
            const matchesHotel = !filterHotel || booking.hotelId.toString() === filterHotel;

            let matchesDateRange = true;
            if (filterDateRange) {
                const today = new Date();
                const checkIn = new Date(booking.checkInDate);

                switch (filterDateRange) {
                    case 'today':
                        matchesDateRange = checkIn.toDateString() === today.toDateString();
                        break;
                    case 'week':
                        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                        matchesDateRange = checkIn >= today && checkIn <= nextWeek;
                        break;
                    case 'month':
                        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
                        matchesDateRange = checkIn >= today && checkIn <= nextMonth;
                        break;
                    case 'past':
                        matchesDateRange = checkIn < today;
                        break;
                    default:
                        matchesDateRange = true;
                }
            }

            return matchesStatus && matchesHotel && matchesDateRange;
        });
    }, [bookings, filterStatus, filterHotel, filterDateRange]);

    const getBookingCounts = () => {
        const counts = {
            total: filteredBookings.length,
            pending: filteredBookings.filter(b => b.bookingStatus === 'PENDING').length,
            confirmed: filteredBookings.filter(b => b.bookingStatus === 'CONFIRMED').length,
            checkedIn: filteredBookings.filter(b => b.bookingStatus === 'CHECKED_IN').length,
            checkedOut: filteredBookings.filter(b => b.bookingStatus === 'CHECKED_OUT').length,
            cancelled: filteredBookings.filter(b => b.bookingStatus === 'CANCELLED').length,
        };
        return counts;
    };

    const bookingCounts = getBookingCounts();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading bookings...</p>
            </div>
        );
    }

    return (
        <div className="bookings-management">
            {/* Message Alert */}
            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    <span className="alert-icon">
                        {message.type === 'success' ? '✅' : '⚠️'}
                    </span>
                    {message.text}
                </div>
            )}

            {/* Stats Overview */}
            <div className="bookings-stats">
                <div className="stat-item stat-total">
                    <div className="stat-number">{bookingCounts.total}</div>
                    <div className="stat-label">Total Bookings</div>
                </div>
                <div className="stat-item stat-pending">
                    <div className="stat-number">{bookingCounts.pending}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-item stat-confirmed">
                    <div className="stat-number">{bookingCounts.confirmed}</div>
                    <div className="stat-label">Confirmed</div>
                </div>
                <div className="stat-item stat-checked-in">
                    <div className="stat-number">{bookingCounts.checkedIn}</div>
                    <div className="stat-label">Checked In</div>
                </div>
                <div className="stat-item stat-checked-out">
                    <div className="stat-number">{bookingCounts.checkedOut}</div>
                    <div className="stat-label">Checked Out</div>
                </div>
            </div>

            {/* Main Card */}
            <div className="management-card">
                <div className="card-header">
                    <div className="header-content">
                        <h3>Bookings Management</h3>
                        <p className="header-subtitle">Monitor and manage all reservations across your properties</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="filter-group">
                        <label>Status:</label>
                        <select
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {bookingStatuses.map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Hotel:</label>
                        <select
                            className="filter-select"
                            value={filterHotel}
                            onChange={(e) => setFilterHotel(e.target.value)}
                        >
                            <option value="">All Hotels</option>
                            {hotels.map(hotel => (
                                <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Check-in:</label>
                        <select
                            className="filter-select"
                            value={filterDateRange}
                            onChange={(e) => setFilterDateRange(e.target.value)}
                        >
                            <option value="">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">Next 7 Days</option>
                            <option value="month">Next 30 Days</option>
                            <option value="past">Past Bookings</option>
                        </select>
                    </div>

                    <div className="results-count">
                        {filteredBookings.length} of {bookings.length} bookings
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="table-container">
                    {filteredBookings.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Booking Details</th>
                                    <th>Guest & Hotel</th>
                                    <th>Dates & Duration</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map(booking => {
                                    const statusInfo = getStatusInfo(booking.bookingStatus);
                                    const paymentInfo = getStatusInfo(booking.paymentStatus, 'payment');
                                    const isUpdating = updatingBooking === booking.id;
                                    const daysUntilCheckIn = getDaysUntilCheckIn(booking.checkInDate);

                                    return (
                                        <tr key={booking.id}>
                                            <td>
                                                <div className="booking-info">
                                                    <div className="booking-id">#{booking.id}</div>
                                                    <div className="booking-details">
                                                        <span>Room {booking.roomId}</span>
                                                        <span className="separator">•</span>
                                                        <span>{booking.adults} adult{booking.adults > 1 ? 's' : ''}</span>
                                                        {booking.children > 0 && (
                                                            <>
                                                                <span className="separator">•</span>
                                                                <span>{booking.children} child{booking.children > 1 ? 'ren' : ''}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {booking.specialRequests && (
                                                        <div className="special-requests">
                                                            <span className="request-icon">📝</span>
                                                            {booking.specialRequests}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="guest-hotel-info">
                                                    <div className="guest-info">
                                                        <span className="guest-icon">👤</span>
                                                        User ID: {booking.userId}
                                                    </div>
                                                    <div className="hotel-info">
                                                        <span className="hotel-icon">🏨</span>
                                                        {getHotelName(booking.hotelId)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="date-info">
                                                    <div className="check-dates">
                                                        <div className="check-in">
                                                            <span className="date-label">Check-in:</span>
                                                            <span className="date-value">{booking.checkInDate}</span>
                                                            {daysUntilCheckIn >= 0 && daysUntilCheckIn <= 7 && (
                                                                <span className="days-notice">
                                                                    {daysUntilCheckIn === 0 ? 'Today' :
                                                                        daysUntilCheckIn === 1 ? 'Tomorrow' :
                                                                            `${daysUntilCheckIn} days`}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="check-out">
                                                            <span className="date-label">Check-out:</span>
                                                            <span className="date-value">{booking.checkOutDate}</span>
                                                        </div>
                                                    </div>
                                                    <div className="duration">
                                                        {Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24))} nights
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="status-info">
                                                    <span className={`status-badge status-${statusInfo.color}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                    <div className="booking-date">
                                                        {new Date(booking.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="payment-info">
                                                    <div className="amount">${booking.totalAmount}</div>
                                                    <span className={`status-badge status-${paymentInfo.color}`}>
                                                        {paymentInfo.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <select
                                                        className="status-select"
                                                        value=""
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                handleStatusUpdate(booking.id, e.target.value);
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                        disabled={isUpdating}
                                                    >
                                                        <option value="">
                                                            {isUpdating ? 'Updating...' : 'Change Status'}
                                                        </option>
                                                        {bookingStatuses
                                                            .filter(status => status.value !== booking.bookingStatus)
                                                            .map(status => (
                                                                <option key={status.value} value={status.value}>
                                                                    {status.label}
                                                                </option>
                                                            ))
                                                        }
                                                    </select>

                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => viewBookingHistory(booking.id)}
                                                    >
                                                        📜 History
                                                    </button>

                                                    {isUpdating && (
                                                        <div className="updating-indicator">
                                                            <span className="spinner-small"></span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon">📋</span>
                            <h3>No bookings found</h3>
                            <p>
                                {filterStatus || filterHotel || filterDateRange
                                    ? 'No bookings match your current filters. Try adjusting your selection.'
                                    : 'No bookings have been made yet.'
                                }
                            </p>
                            {(filterStatus || filterHotel || filterDateRange) && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setFilterStatus('');
                                        setFilterHotel('');
                                        setFilterDateRange('');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking History Modal */}
            {showHistoryModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Booking History - #{selectedBookingId}</h3>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowHistoryModal(false);
                                    setBookingHistory([]);
                                    setSelectedBookingId(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            {bookingHistory.length > 0 ? (
                                <div className="history-timeline">
                                    {bookingHistory.map(history => (
                                        <div key={history.id} className="timeline-item">
                                            <div className="timeline-marker"></div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <div className="status-change">
                                                        {history.statusFrom ? (
                                                            <>
                                                                <span className={`status-badge status-${getStatusInfo(history.statusFrom).color}`}>
                                                                    {getStatusInfo(history.statusFrom).label}
                                                                </span>
                                                                <span className="arrow">→</span>
                                                            </>
                                                        ) : (
                                                            <span className="created-label">Created</span>
                                                        )}
                                                        <span className={`status-badge status-${getStatusInfo(history.statusTo).color}`}>
                                                            {getStatusInfo(history.statusTo).label}
                                                        </span>
                                                    </div>
                                                    <div className="timeline-date">
                                                        {new Date(history.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="timeline-details">
                                                    <div className="changed-by">
                                                        <span className="user-icon">👤</span>
                                                        User {history.changedBy}
                                                    </div>
                                                    <div className="change-reason">
                                                        {history.changeReason}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <span className="empty-icon">📜</span>
                                    <p>No history available for this booking</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsManagement;