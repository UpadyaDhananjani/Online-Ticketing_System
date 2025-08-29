// src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/notificationApi.js';
import { toast } from 'react-toastify';

export const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch notifications from the API
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            console.log('Fetched notifications:', data);
            
            // Handle different response structures
            if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.isRead).length);
            } else if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount || data.notifications.filter(n => !n.isRead).length);
            } else {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Don't show toast error on initial load to avoid spam
            if (notifications.length > 0) {
                toast.error('Failed to fetch notifications');
            }
        } finally {
            setLoading(false);
        }
    };

    // Use a useEffect hook to call the fetch function when the component mounts
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Refresh notifications every 30 seconds
    useEffect(() => {
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // This function will add a new notification to the state
    const createNotification = (message, type, ticketId) => {
        const newNotification = {
            _id: Date.now().toString(),
            message,
            type,
            ticket: ticketId,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
        setUnreadCount(prevCount => prevCount + 1);
    };

    // Function to mark a single notification as read
    const markOneAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n._id === id ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
            toast.success('Notification marked as read');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    // Function to mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prevNotifications =>
                prevNotifications.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        createNotification,
        markOneAsRead,
        markAllAsRead,
        fetchNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
