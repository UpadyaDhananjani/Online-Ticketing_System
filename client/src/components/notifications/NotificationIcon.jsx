// src/components/notifications/NotificationIcon.jsx
import React from 'react';
import { useNotifications } from "../../context/NotificationContext.jsx";

const NotificationIcon = ({ isCollapsed, onClick }) => {
    const { unreadCount } = useNotifications();

    return (
        <div className="d-flex align-items-center position-relative" onClick={onClick} style={{ cursor: 'pointer' }}>
            <i className="bi bi-bell-fill me-2"></i>
            {!isCollapsed && "Notifications"}
            {unreadCount > 0 && (
                <span 
                    className={`badge bg-danger position-absolute ${isCollapsed ? 'top-0 start-100' : 'start-100'} translate-middle`}
                    style={{ 
                        fontSize: '0.75rem', 
                        minWidth: '1.5rem', 
                        height: '1.5rem', 
                        borderRadius: '0.75rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </div>
    );
};

export default NotificationIcon;
