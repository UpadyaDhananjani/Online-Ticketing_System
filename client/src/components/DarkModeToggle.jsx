// Add this to your main layout or AdminDashboard.jsx (top-level component)
import React, { useEffect, useState } from "react";

function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage and apply dark mode on component mount
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDark(savedDarkMode);
    document.documentElement.classList.toggle("dark", savedDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  return (
    <button
      onClick={toggleDarkMode}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 9999,
        background: isDark ? "#374151" : "#1f2937",
        color: "#fff",
        padding: "10px 18px",
        borderRadius: "8px",
        border: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        transition: "background-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.target.style.background = isDark ? "#4b5563" : "#374151";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = isDark ? "#374151" : "#1f2937";
      }}
    >
      {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
    </button>
  );
}

export default DarkModeToggle;