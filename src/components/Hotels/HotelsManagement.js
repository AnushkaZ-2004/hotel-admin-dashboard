// src/components/Hotels/HotelsManagement.js
import React, { useState, useEffect, useMemo } from 'react';
import { hotelService } from '../../services/api';

const HotelsManagement = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingHotel, setEditingHotel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        phone: '',
        email: '',
        rating: 0
    });

    useEffect(() => {
        loadHotels();
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

    const loadHotels = async () => {
        try {
            setLoading(true);
            const data = await hotelService.getAll();
            setHotels(data);
        } catch (error) {
            console.error('Error loading hotels:', error);
            setMessage({ type: 'error', text: 'Error loading hotels. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const filteredHotels = useMemo(() => {
        return hotels.filter(hotel => {
            const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hotel.address.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCity = !filterCity || hotel.city === filterCity;
            return matchesSearch && matchesCity;
        });
    }, [hotels, searchTerm, filterCity]);

    const cities = useMemo(() => {
        return [...new Set(hotels.map(hotel => hotel.city))].sort();
    }, [hotels]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (editingHotel) {
                await hotelService.update(editingHotel.id, formData);
                setMessage({ type: 'success', text: 'Hotel updated successfully!' });
            } else {
                await hotelService.create(formData);
                setMessage({ type: 'success', text: 'Hotel created successfully!' });
            }
            await loadHotels();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving hotel:', error);
            setMessage({ type: 'error', text: 'Error saving hotel. Please try again.' });
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (hotel) => {
        setEditingHotel(hotel);
        setFormData({
            name: hotel.name || '',
            description: hotel.description || '',
            address: hotel.address || '',
            city: hotel.city || '',
            state: hotel.state || '',
            country: hotel.country || '',
            postalCode: hotel.postalCode || '',
            phone: hotel.phone || '',
            email: hotel.email || '',
            rating: hotel.rating || 0
        });
        setShowModal(true);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            try {
                await hotelService.delete(id);
                setMessage({ type: 'success', text: 'Hotel deleted successfully!' });
                await loadHotels();
            } catch (error) {
                console.error('Error deleting hotel:', error);
                setMessage({ type: 'error', text: 'Error deleting hotel. Please try again.' });
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            address: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            phone: '',
            email: '',
            rating: 0
        });
        setEditingHotel(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleModalClose = () => {
        setShowModal(false);
        resetForm();
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} style={{ color: i <= rating ? '#f6ad55' : '#e2e8f0' }}>
                    ★
                </span>
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading hotels...</p>
            </div>
        );
    }

    return (
        <div className="hotels-management">
            {/* Message Alert */}
            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    <span className="alert-icon">
                        {message.type === 'success' ? '✅' : '⚠️'}
                    </span>
                    {message.text}
                </div>
            )}

            {/* Main Card */}
            <div className="management-card">
                <div className="card-header">
                    <div className="header-content">
                        <h3>Hotels Management</h3>
                        <p className="header-subtitle">Manage your hotel properties and their details</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        <span className="btn-icon">+</span>
                        Add New Hotel
                    </button>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="search-filter">
                        <div className="search-input-group">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search hotels by name, city, or address..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={filterCity}
                            onChange={(e) => setFilterCity(e.target.value)}
                        >
                            <option value="">All Cities</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="results-count">
                        {filteredHotels.length} of {hotels.length} hotels
                    </div>
                </div>

                {/* Hotels Table */}
                <div className="table-container">
                    {filteredHotels.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Hotel Details</th>
                                    <th>Location</th>
                                    <th>Contact</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHotels.map(hotel => (
                                    <tr key={hotel.id}>
                                        <td>
                                            <div className="hotel-info">
                                                <div className="hotel-name">{hotel.name}</div>
                                                {hotel.description && (
                                                    <div className="hotel-description">{hotel.description}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="location-info">
                                                <div className="primary-location">
                                                    {hotel.city}, {hotel.state}
                                                </div>
                                                <div className="secondary-location">
                                                    {hotel.country}
                                                </div>
                                                <div className="address">
                                                    {hotel.address}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                {hotel.phone && (
                                                    <div className="contact-item">
                                                        <span className="contact-icon">📞</span>
                                                        {hotel.phone}
                                                    </div>
                                                )}
                                                {hotel.email && (
                                                    <div className="contact-item">
                                                        <span className="contact-icon">📧</span>
                                                        {hotel.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="rating-display">
                                                <div className="stars">
                                                    {renderStars(hotel.rating || 0)}
                                                </div>
                                                <div className="rating-text">
                                                    {hotel.rating || 0}/5
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEdit(hotel)}
                                                    title="Edit hotel"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(hotel.id, hotel.name)}
                                                    title="Delete hotel"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon">🏨</span>
                            <h3>No hotels found</h3>
                            <p>
                                {searchTerm || filterCity
                                    ? 'No hotels match your search criteria. Try adjusting your filters.'
                                    : 'No hotels have been added yet. Click "Add New Hotel" to create your first property.'
                                }
                            </p>
                            {!searchTerm && !filterCity && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowModal(true)}
                                >
                                    Add Your First Hotel
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h3>
                            <button
                                className="modal-close"
                                onClick={handleModalClose}
                                disabled={formLoading}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-section">
                                    <h4>Basic Information</h4>

                                    <div className="form-group">
                                        <label htmlFor="name">Hotel Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter hotel name"
                                            disabled={formLoading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="description">Description</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Enter hotel description"
                                            rows="3"
                                            disabled={formLoading}
                                        />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4>Location Details</h4>

                                    <div className="form-group">
                                        <label htmlFor="address">Address *</label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter full address"
                                            disabled={formLoading}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="city">City *</label>
                                            <input
                                                type="text"
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter city"
                                                disabled={formLoading}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="state">State/Province</label>
                                            <input
                                                type="text"
                                                id="state"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                placeholder="Enter state"
                                                disabled={formLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="country">Country *</label>
                                            <input
                                                type="text"
                                                id="country"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter country"
                                                disabled={formLoading}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="postalCode">Postal Code</label>
                                            <input
                                                type="text"
                                                id="postalCode"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleChange}
                                                placeholder="Enter postal code"
                                                disabled={formLoading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4>Contact Information</h4>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Enter phone number"
                                                disabled={formLoading}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email Address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter email address"
                                                disabled={formLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="rating">Star Rating</label>
                                        <select
                                            id="rating"
                                            name="rating"
                                            value={formData.rating}
                                            onChange={handleChange}
                                            disabled={formLoading}
                                        >
                                            <option value={0}>Select Rating</option>
                                            <option value={1}>1 Star</option>
                                            <option value={2}>2 Stars</option>
                                            <option value={3}>3 Stars</option>
                                            <option value={4}>4 Stars</option>
                                            <option value={5}>5 Stars</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleModalClose}
                                    disabled={formLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={formLoading}
                                >
                                    {formLoading ? (
                                        <span className="btn-loading">
                                            <span className="spinner"></span>
                                            {editingHotel ? 'Updating...' : 'Creating...'}
                                        </span>
                                    ) : (
                                        editingHotel ? 'Update Hotel' : 'Create Hotel'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelsManagement;