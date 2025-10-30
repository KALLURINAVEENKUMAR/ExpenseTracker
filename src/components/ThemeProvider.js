import React, { createContext, useContext, useEffect, useState } from 'react';
import { MdLightMode, MdDarkMode } from 'react-icons/md';

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('expense-tracker-theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Update CSS custom properties based on theme
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-glass', 'rgba(30, 41, 59, 0.25)');
      root.style.setProperty('--bg-glass-hover', 'rgba(30, 41, 59, 0.35)');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#e2e8f0');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--border-light', 'rgba(148, 163, 184, 0.2)');
      root.style.setProperty('--border-subtle', '#334155');
    } else {
      root.style.setProperty('--bg-primary', '#f8fafc');
      root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--bg-glass', 'rgba(255, 255, 255, 0.25)');
      root.style.setProperty('--bg-glass-hover', 'rgba(255, 255, 255, 0.35)');
      root.style.setProperty('--text-primary', '#1a202c');
      root.style.setProperty('--text-secondary', '#4a5568');
      root.style.setProperty('--text-muted', '#718096');
      root.style.setProperty('--border-light', 'rgba(255, 255, 255, 0.2)');
      root.style.setProperty('--border-subtle', '#e2e8f0');
    }
    
    // Save to localStorage
    localStorage.setItem('expense-tracker-theme', theme);
    
    // Update document class for additional styling
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Toggle Button Component
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <MdDarkMode size={24} /> : <MdLightMode size={24} />}
    </button>
  );
};