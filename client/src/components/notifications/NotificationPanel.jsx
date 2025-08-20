// src/components/notifications/NotificationPanel.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import axios from 'axios';
import { Spinner, ListGroup } from 'react-bootstrap';
import { BsBellFill } from 'react-icons/bs';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AppContext);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/notifications', {
                headers: {
                    // Send the authorization token with the request
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            // Update the notifications state with the fetched data
            setNotifications(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            setError("Failed to load notifications. Please try again later.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            // If there's no token, we can't fetch notifications, so we stop here.
            setLoading(false);
            return;
        }

        // Fetch notifications on component mount
        fetchNotifications();

        // Set up a polling interval to fetch new notifications every 10 seconds.
        const intervalId = setInterval(fetchNotifications, 10000);

        // Clean up the interval when the component unmounts to prevent memory leaks.
        return () => clearInterval(intervalId);
    }, [token]);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`/api/notifications/${id}/read`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            // Immediately update the UI without waiting for the next fetch
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-danger mt-3">{error}</div>;
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center text-muted mt-3">
                <BsBellFill size={32} />
                <p>No new notifications.</p>
            </div>
        );
    }

    return (
        <ListGroup variant="flush">
            {notifications.map(notification => (
                <ListGroup.Item
                    key={notification._id}
                    action
                    onClick={() => handleMarkAsRead(notification._id)}
                    className={`d-flex justify-content-between align-items-center ${!notification.isRead ? 'bg-light font-weight-bold' : ''}`}
                >
                    <div>
                        {notification.message}
                        <div className="text-muted small">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                    </div>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default NotificationPanel;
