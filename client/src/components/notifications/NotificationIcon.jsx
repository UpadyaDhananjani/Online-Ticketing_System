// src/components/notifications/NotificationIcon.jsx
import React, { useState, useContext } from 'react';
import { Bell } from 'lucide-react';
import { NotificationContext } from "../../context/NotificationContext.jsx";
import NotificationPanel from './NotificationPanel.jsx';

const NotificationIcon = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { unreadCount, markAllAsRead } = useContext(NotificationContext);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                aria-label="Notifications"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-lg">Notifications</h3>
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                            Mark all as read
                        </button>
                    </div>
                    <NotificationPanel />
                </div>
            )}
        </div>
    );
};

export default NotificationIcon;
