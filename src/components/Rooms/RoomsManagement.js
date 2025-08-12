// src/components/Rooms/RoomsManagement.js
import React, { useState, useEffect, useMemo } from 'react';
import { roomService, hotelService, roomTypeService } from '../../services/api';

const RoomsManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterHotel, setFilterHotel] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterRoomType, setFilterRoomType] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [updatingRoom, setUpdatingRoom] = useState(null);

    const roomStatuses = [
        { value: 'AVAILABLE', label: 'Available', color: 'success' },
        { value: 'OCCUPIED', label: 'Occupied', color: 'danger' },
        { value: 'MAINTENANCE', label: 'Maintenance', color: 'warning' },
        { value: 'OUT_OF_ORDER', label: 'Out of Order', color: 'danger' }
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
            const [roomsData, hotelsData, roomTypesData] = await Promise.all([
                roomService.getAll(),
                hotelService.getAll(),
                roomTypeService.getAll()
            ]);

            setRooms(roomsData);
            setHotels(hotelsData);
            setRoomTypes(roomTypesData);
        } catch (error) {
            console.error('Error loading data:', error);
            setMessage({ type: 'error', text: 'Error loading room data. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const updateRoomStatus = async (roomId, newStatus) => {
        try {
            setUpdatingRoom(roomId);
            const room = rooms.find(r => r.id === roomId);
            await roomService.update(roomId, { ...room, status: newStatus });
            setMessage({ type: 'success', text: 'Room status updated successfully!' });
            await loadData();
        } catch (error) {
            console.error('Error updating room status:', error);
            setMessage({ type: 'error', text: 'Error updating room status. Please try again.' });
        } finally {
            setUpdatingRoom(null);
        }
    };

    const getHotelName = (hotelId) => {
        const hotel = hotels.find(h => h.id === hotelId);
        return hotel ? hotel.name : `Hotel ${hotelId}`;
    };

    const getRoomTypeName = (roomTypeId) => {
        const roomType = roomTypes.find(rt => rt.id === roomTypeId);
        return roomType ? roomType.name : `Type ${roomTypeId}`;
    };

    const getRoomTypePrice = (roomTypeId) => {
        const roomType = roomTypes.find(rt => rt.id === roomTypeId);
        return roomType ? roomType.basePrice : 0;
    };

    const getRoomTypeCapacity = (roomTypeId) => {
        const roomType = roomTypes.find(rt => rt.id === roomTypeId);
        return roomType ? roomType.maxOccupancy : 0;
    };

    const filteredRooms = useMemo(() => {
        return rooms.filter(room => {
            const matchesHotel = !filterHotel || room.hotelId.toString() === filterHotel;
            const matchesStatus = !filterStatus || room.status === filterStatus;
            const matchesRoomType = !filterRoomType || room.roomTypeId.toString() === filterRoomType;
            return matchesHotel && matchesStatus && matchesRoomType;
        });
    }, [rooms, filterHotel, filterStatus, filterRoomType]);

    const availableRoomTypes = useMemo(() => {
        if (!filterHotel) return roomTypes;
        return roomTypes.filter(rt => rt.hotelId.toString() === filterHotel);
    }, [roomTypes, filterHotel]);

    const getStatusInfo = (status) => {
        const statusInfo = roomStatuses.find(s => s.value === status);
        return statusInfo || { value: status, label: status, color: 'secondary' };
    };

    const getStatusCounts = () => {
        const counts = {
            total: filteredRooms.length,
            available: filteredRooms.filter(r => r.status === 'AVAILABLE').length,
            occupied: filteredRooms.filter(r => r.status === 'OCCUPIED').length,
            maintenance: filteredRooms.filter(r => r.status === 'MAINTENANCE').length,
            outOfOrder: filteredRooms.filter(r => r.status === 'OUT_OF_ORDER').length,
        };
        return counts;
    };

    const statusCounts = getStatusCounts();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading rooms...</p>
            </div>
        );
    }

    return (
        <div className="rooms-management">
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
            <div className="rooms-stats">
                <div className="stat-item stat-total">
                    <div className="stat-number">{statusCounts.total}</div>
                    <div className="stat-label">Total Rooms</div>
                </div>
                <div className="stat-item stat-available">
                    <div className="stat-number">{statusCounts.available}</div>
                    <div className="stat-label">Available</div>
                </div>
                <div className="stat-item stat-occupied">
                    <div className="stat-number">{statusCounts.occupied}</div>
                    <div className="stat-label">Occupied</div>
                </div>
                <div className="stat-item stat-maintenance">
                    <div className="stat-number">{statusCounts.maintenance}</div>
                    <div className="stat-label">Maintenance</div>
                </div>
                <div className="stat-item stat-out-of-order">
                    <div className="stat-number">{statusCounts.outOfOrder}</div>
                    <div className="stat-label">Out of Order</div>
                </div>
            </div>

            {/* Main Card */}
            <div className="management-card">
                <div className="card-header">
                    <div className="header-content">
                        <h3>Rooms Management</h3>
                        <p className="header-subtitle">Monitor and manage room availability across all properties</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="filter-group">
                        <label>Hotel:</label>
                        <select
                            className="filter-select"
                            value={filterHotel}
                            onChange={(e) => {
                                setFilterHotel(e.target.value);
                                setFilterRoomType(''); // Reset room type filter when hotel changes
                            }}
                        >
                            <option value="">All Hotels</option>
                            {hotels.map(hotel => (
                                <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Status:</label>
                        <select
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {roomStatuses.map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Room Type:</label>
                        <select
                            className="filter-select"
                            value={filterRoomType}
                            onChange={(e) => setFilterRoomType(e.target.value)}
                        >
                            <option value="">All Room Types</option>
                            {availableRoomTypes.map(roomType => (
                                <option key={roomType.id} value={roomType.id}>{roomType.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="results-count">
                        {filteredRooms.length} of {rooms.length} rooms
                    </div>
                </div>

                {/* Rooms Grid */}
                <div className="rooms-grid">
                    {filteredRooms.length > 0 ? (
                        filteredRooms.map(room => {
                            const statusInfo = getStatusInfo(room.status);
                            const isUpdating = updatingRoom === room.id;

                            return (
                                <div key={room.id} className={`room-card status-${statusInfo.color}`}>
                                    <div className="room-header">
                                        <div className="room-number">
                                            <span className="room-icon">🛏️</span>
                                            Room {room.roomNumber}
                                        </div>
                                        <div className={`status-badge status-${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </div>
                                    </div>

                                    <div className="room-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Hotel:</span>
                                            <span className="detail-value">{getHotelName(room.hotelId)}</span>
                                        </div>

                                        <div className="detail-item">
                                            <span className="detail-label">Type:</span>
                                            <span className="detail-value">{getRoomTypeName(room.roomTypeId)}</span>
                                        </div>

                                        <div className="detail-item">
                                            <span className="detail-label">Floor:</span>
                                            <span className="detail-value">{room.floor}</span>
                                        </div>

                                        <div className="detail-item">
                                            <span className="detail-label">Capacity:</span>
                                            <span className="detail-value">{getRoomTypeCapacity(room.roomTypeId)} guests</span>
                                        </div>

                                        <div className="detail-item">
                                            <span className="detail-label">Rate:</span>
                                            <span className="detail-value price">${getRoomTypePrice(room.roomTypeId)}/night</span>
                                        </div>
                                    </div>

                                    <div className="room-actions">
                                        <select
                                            className="status-select"
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    updateRoomStatus(room.id, e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                            disabled={isUpdating}
                                        >
                                            <option value="">
                                                {isUpdating ? 'Updating...' : 'Change Status'}
                                            </option>
                                            {roomStatuses
                                                .filter(status => status.value !== room.status)
                                                .map(status => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))
                                            }
                                        </select>

                                        {isUpdating && (
                                            <div className="updating-indicator">
                                                <span className="spinner-small"></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon">🛏️</span>
                            <h3>No rooms found</h3>
                            <p>
                                {filterHotel || filterStatus || filterRoomType
                                    ? 'No rooms match your current filters. Try adjusting your selection.'
                                    : 'No rooms have been added yet.'
                                }
                            </p>
                            {(filterHotel || filterStatus || filterRoomType) && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setFilterHotel('');
                                        setFilterStatus('');
                                        setFilterRoomType('');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="status-legend">
                    <h4>Status Legend:</h4>
                    <div className="legend-items">
                        {roomStatuses.map(status => (
                            <div key={status.value} className="legend-item">
                                <span className={`legend-dot status-${status.color}`}></span>
                                <span className="legend-label">{status.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomsManagement;