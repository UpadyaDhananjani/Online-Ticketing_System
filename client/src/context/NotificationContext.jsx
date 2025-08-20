// src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // This function simulates fetching notifications from an API.
    // In a real app, you would make an API call here.
    const fetchNotifications = () => {
        // Dummy data to simulate API response
        const dummyNotifications = [
            { id: '1', message: 'A new ticket has been created: T-001', type: 'new_ticket', isRead: false, ticketId: 'T-001', createdAt: '2025-08-19T10:00:00Z' },
            { id: '2', message: 'Your ticket T-002 has been updated by an admin.', type: 'admin_reply', isRead: false, ticketId: 'T-002', createdAt: '2025-08-19T09:30:00Z' },
            { id: '3', message: 'Ticket T-003 has been reassigned to a new agent.', type: 'reassigned', isRead: true, ticketId: 'T-003', createdAt: '2025-08-18T18:00:00Z' },
            { id: '4', message: 'A new ticket has been created: T-004', type: 'new_ticket', isRead: false, ticketId: 'T-004', createdAt: '2025-08-17T15:45:00Z' },
        ];
        
        // Update the notifications state
        setNotifications(dummyNotifications);

        // Update the unread count based on the fetched data
        const unread = dummyNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
    };

    // Use a useEffect hook to call the fetch function when the component mounts
    useEffect(() => {
        fetchNotifications();
    }, []);

    // This function will add a new notification to the state
    const createNotification = (message, type, ticketId) => {
        const newNotification = {
            id: Date.now().toString(), // Use a string ID for consistency
            message,
            type,
            ticketId,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
        setUnreadCount(prevCount => prevCount + 1);
    };

    // Function to mark a single notification as read
    const markOneAsRead = (id) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            )
        );
        setUnreadCount(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
    };

    // Function to mark all notifications as read
    const markAllAsRead = () => {
        setNotifications(prevNotifications =>
            prevNotifications.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
    };

    const value = {
        notifications,
        unreadCount,
        createNotification,
        markOneAsRead,
        markAllAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
