// src/components/ThemeToggle.jsx
import React from 'react';
// Ensure this path is correct relative to where ThemeContext.jsx is located.
// If ThemeContext.jsx is in 'src/context/', and ThemeToggle.jsx is in 'src/components/',
// then '../context/ThemeContext.jsx' is the correct relative path.
import { useTheme } from '../context/ThemeContext.jsx'; // <--- Check this path and .jsx extension

// Ensure Font Awesome is installed:
// npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

// Import CSS for this component (ensure this file exists and contains the styles)
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className={`theme-toggle-button ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
            {/* Render sun icon if dark theme, moon icon if light theme */}
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
            {/* Visually hidden text for accessibility, if only an icon is shown */}
            <span className="sr-only">Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
        </button>
    );
};

export default ThemeToggle;