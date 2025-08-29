// src/hooks/useNotifications.js
import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { NotificationContext } from '../context/NotificationContext';

const useNotifications = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useContext(AppContext);
    
    // Destructure `createNotification` here
    const { notifications, setNotifications, createNotification } = useContext(NotificationContext);

    const fetchNotifications = async () => {
        if (!token) {
            setNotifications([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/notifications', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }
            const data = await response.json();
            setNotifications(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const markOneAsRead = async (id) => {
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [token]);

    return { notifications, loading, error, fetchNotifications, markOneAsRead, markAllAsRead, createNotification };
};

export default useNotifications;