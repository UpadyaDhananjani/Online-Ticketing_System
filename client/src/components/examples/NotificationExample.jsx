// client/src/components/examples/NotificationExample.jsx
import React from 'react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { Button, Alert } from 'react-bootstrap';

/**
 * Example component showing how to use the notification system
 * This is just for demonstration - you can integrate these patterns into your existing components
 */
const NotificationExample = () => {
    const { 
        notifications, 
        unreadCount, 
        loading, 
        markOneAsRead, 
        markAllAsRead, 
        createNotification 
    } = useNotifications();

    // Example: Create a test notification
    const handleCreateTestNotification = () => {
        createNotification(
            'This is a test notification!', 
            'new_ticket', 
            'test-ticket-id'
        );
    };

    // Example: Mark a specific notification as read
    const handleMarkAsRead = (notificationId) => {
        markOneAsRead(notificationId);
    };

    // Example: Mark all notifications as read
    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    return (
        <div className="p-4">
            <h3>Notification System Example</h3>
            
            {/* Display current status */}
            <Alert variant="info">
                <strong>Unread Count:</strong> {unreadCount} | 
                <strong> Total Notifications:</strong> {notifications.length} |
                <strong> Loading:</strong> {loading ? 'Yes' : 'No'}
            </Alert>

            {/* Action buttons */}
            <div className="mb-3">
                <Button 
                    variant="primary" 
                    onClick={handleCreateTestNotification}
                    className="me-2"
                >
                    Create Test Notification
                </Button>
                <Button 
                    variant="success" 
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                >
                    Mark All as Read ({unreadCount})
                </Button>
            </div>

            {/* Display notifications */}
            <div>
                <h4>Recent Notifications:</h4>
                {notifications.length === 0 ? (
                    <p className="text-muted">No notifications yet.</p>
                ) : (
                    <div className="list-group">
                        {notifications.slice(0, 5).map(notification => (
                            <div 
                                key={notification._id}
                                className={`list-group-item ${!notification.isRead ? 'list-group-item-primary' : ''}`}
                            >
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="mb-1">{notification.message}</p>
                                        <small className="text-muted">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </small>
                                    </div>
                                    {!notification.isRead && (
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => handleMarkAsRead(notification._id)}
                                        >
                                            Mark as Read
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Usage instructions */}
            <div className="mt-4 p-3 bg-light rounded">
                <h5>How to use in your components:</h5>
                <pre className="bg-dark text-light p-2 rounded" style={{ fontSize: '0.8rem' }}>
{`// Import the hook
import { useNotifications } from '../context/NotificationContext.jsx';

// Use in your component
const MyComponent = () => {
    const { notifications, unreadCount, markOneAsRead } = useNotifications();
    
    return (
        <div>
            <p>You have {unreadCount} unread notifications</p>
            {/* Your component content */}
        </div>
    );
};`}
                </pre>
            </div>
        </div>
    );
};

export default NotificationExample;
