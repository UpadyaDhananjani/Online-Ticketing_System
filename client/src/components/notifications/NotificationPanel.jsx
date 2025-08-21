// src/components/notifications/NotificationPanel.jsx
import React from 'react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { Spinner, ListGroup, Button, Badge } from 'react-bootstrap';
import { BsBellFill, BsCheck2All, BsCircleFill } from 'react-icons/bs';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = ({ onClose }) => {
    const { notifications, loading, markOneAsRead, markAllAsRead, unreadCount } = useNotifications();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center text-muted mt-3 p-3">
                <BsBellFill size={32} />
                <p className="mt-2">No notifications yet.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header with close button and mark all as read button */}
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h6 className="mb-0 fw-bold">Notifications</h6>
                <div className="d-flex gap-2">
                    {unreadCount > 0 && (
                        <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={markAllAsRead}
                            className="d-flex align-items-center gap-1"
                        >
                            <BsCheck2All />
                            Mark all read
                        </Button>
                    )}
                    {onClose && (
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <i className="bi bi-x-lg"></i>
                        </Button>
                    )}
                </div>
            </div>
            
            {unreadCount > 0 && (
                <div className="px-3 py-2 bg-light">
                    <small className="text-muted">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </small>
                </div>
            )}
            
            {/* Notifications list */}
            <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.map(notification => (
                    <ListGroup.Item
                        key={notification._id}
                        action
                        onClick={() => !notification.isRead && markOneAsRead(notification._id)}
                        className={`d-flex justify-content-between align-items-start ${!notification.isRead ? 'bg-light' : ''}`}
                        style={{ cursor: notification.isRead ? 'default' : 'pointer' }}
                    >
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-start gap-2">
                                {!notification.isRead && (
                                    <BsCircleFill 
                                        size={8} 
                                        className="text-primary mt-1" 
                                        style={{ minWidth: '8px' }}
                                    />
                                )}
                                <div className={!notification.isRead ? 'fw-bold' : ''}>
                                    {notification.message}
                                </div>
                            </div>
                            <div className="text-muted small mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </div>
                            {notification.type && (
                                <Badge 
                                    bg={getNotificationTypeBadge(notification.type)} 
                                    className="mt-1"
                                    style={{ fontSize: '0.7rem' }}
                                >
                                    {formatNotificationType(notification.type)}
                                </Badge>
                            )}
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
};

// Helper function to get badge color for notification type
const getNotificationTypeBadge = (type) => {
    switch (type) {
        case 'new_ticket': return 'primary';
        case 'admin_reply': return 'success';
        case 'user_reply': return 'info';
        case 'reassigned': return 'warning';
        case 'resolved': return 'success';
        case 'closed': return 'secondary';
        default: return 'light';
    }
};

// Helper function to format notification type for display
const formatNotificationType = (type) => {
    const typeMap = {
        'new_ticket': 'New Ticket',
        'admin_reply': 'Admin Reply',
        'user_reply': 'User Reply',
        'reassigned': 'Reassigned',
        'resolved': 'Resolved',
        'closed': 'Closed'
    };
    return typeMap[type] || type;
};

export default NotificationPanel;
