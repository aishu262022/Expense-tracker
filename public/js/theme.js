// Theme Management Script
// This script handles dark mode functionality across all pages

// Enhanced color palette for dark mode
const DARK_MODE_COLORS = {
  // Backgrounds
  bgPrimary: '#121212',
  bgSecondary: '#1e1e2f',
  bgCard: '#2d2d44',
  bgInput: '#3a3a4a',
  bgHover: '#4a4a5a',
  
  // Text colors
  textPrimary: '#e0e0e0',
  textSecondary: '#b0b0b0',
  textMuted: '#888888',
  
  // Borders and shadows
  borderColor: '#555555',
  shadowLight: 'rgba(0,0,0,0.3)',
  shadowDark: 'rgba(0,0,0,0.5)',
  
  // Accent colors
  accentPrimary: '#00BFFF',
  accentSecondary: '#1DE9B6',
  accentHover: '#0099CC',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3'
};

// Function to apply dark mode with enhanced styling
function applyDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    // Add enhanced dark mode styles
    addEnhancedDarkModeStyles();
  } else {
    document.body.classList.remove('dark-mode');
    // Remove enhanced styles
    removeEnhancedDarkModeStyles();
  }
}

// Function to add enhanced dark mode styles
function addEnhancedDarkModeStyles() {
  if (document.getElementById('enhanced-dark-styles')) {
    return; // Styles already added
  }

  const enhancedStyles = `
    /* Enhanced Dark Mode Styles */
    body.dark-mode {
      background: ${DARK_MODE_COLORS.bgPrimary} !important;
      color: ${DARK_MODE_COLORS.textPrimary} !important;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Container backgrounds */
    body.dark-mode .dashboard-container,
    body.dark-mode .settings-container,
    body.dark-mode .expense-container,
    body.dark-mode .emi-container,
    body.dark-mode .debt-container,
    body.dark-mode .savings-container,
    body.dark-mode .profile-container {
      background: ${DARK_MODE_COLORS.bgPrimary} !important;
    }

    /* Sidebar styling */
    body.dark-mode .sidebar {
      background: ${DARK_MODE_COLORS.bgSecondary} !important;
      box-shadow: 2px 0 12px ${DARK_MODE_COLORS.shadowDark} !important;
      border-right: 1px solid ${DARK_MODE_COLORS.borderColor} !important;
    }

    /* Card backgrounds */
    body.dark-mode .dashboard-card,
    body.dark-mode .settings-card,
    body.dark-mode .expense-card,
    body.dark-mode .emi-card,
    body.dark-mode .debt-card,
    body.dark-mode .savings-card,
    body.dark-mode .profile-card,
    body.dark-mode .savings-goal-card,
    body.dark-mode .savings-progress-card,
    body.dark-mode .savings-tips-card,
    body.dark-mode .debt-item,
    body.dark-mode .emi-item,
    body.dark-mode .expense-item {
      background: ${DARK_MODE_COLORS.bgCard} !important;
      box-shadow: 0 2px 12px ${DARK_MODE_COLORS.shadowLight} !important;
      border: 1px solid ${DARK_MODE_COLORS.borderColor} !important;
      transition: all 0.3s ease;
    }

    /* Text colors */
    body.dark-mode .card-title,
    body.dark-mode .settings-card-title,
    body.dark-mode .dashboard-graph-title,
    body.dark-mode .savings-goal-title,
    body.dark-mode .debt-title,
    body.dark-mode .emi-title,
    body.dark-mode .expense-title,
    body.dark-mode .profile-title,
    body.dark-mode h1, body.dark-mode h2, body.dark-mode h3,
    body.dark-mode .profile-name,
    body.dark-mode .dropdown-name {
      color: ${DARK_MODE_COLORS.textPrimary} !important;
    }

    body.dark-mode .card-desc,
    body.dark-mode .settings-card-desc,
    body.dark-mode .dashboard-graph-desc,
    body.dark-mode .savings-goal-sub,
    body.dark-mode .debt-subtitle,
    body.dark-mode .emi-subtitle,
    body.dark-mode .expense-subtitle,
    body.dark-mode .profile-email,
    body.dark-mode .dropdown-email {
      color: ${DARK_MODE_COLORS.textSecondary} !important;
    }

    /* Form inputs */
    body.dark-mode .form-input,
    body.dark-mode .auth-input,
    body.dark-mode input[type="text"],
    body.dark-mode input[type="email"],
    body.dark-mode input[type="password"],
    body.dark-mode input[type="number"],
    body.dark-mode input[type="tel"],
    body.dark-mode textarea,
    body.dark-mode select {
      background: ${DARK_MODE_COLORS.bgInput} !important;
      color: ${DARK_MODE_COLORS.textPrimary} !important;
      border-color: ${DARK_MODE_COLORS.borderColor} !important;
      transition: all 0.3s ease;
    }

    body.dark-mode .form-input:focus,
    body.dark-mode .auth-input:focus,
    body.dark-mode input:focus,
    body.dark-mode textarea:focus,
    body.dark-mode select:focus {
      background: ${DARK_MODE_COLORS.bgHover} !important;
      border-color: ${DARK_MODE_COLORS.accentPrimary} !important;
      box-shadow: 0 0 0 2px ${DARK_MODE_COLORS.accentPrimary}20 !important;
    }

    /* Labels */
    body.dark-mode .form-label,
    body.dark-mode .auth-label {
      color: ${DARK_MODE_COLORS.textPrimary} !important;
    }

    /* Buttons */
    body.dark-mode .btn-secondary,
    body.dark-mode .back-btn,
    body.dark-mode .logout-btn {
      background: ${DARK_MODE_COLORS.bgCard} !important;
      color: ${DARK_MODE_COLORS.accentPrimary} !important;
      border-color: ${DARK_MODE_COLORS.accentPrimary} !important;
      transition: all 0.3s ease;
    }

    body.dark-mode .btn-secondary:hover,
    body.dark-mode .back-btn:hover,
    body.dark-mode .logout-btn:hover {
      background: ${DARK_MODE_COLORS.accentPrimary} !important;
      color: ${DARK_MODE_COLORS.bgCard} !important;
    }

    /* Dropdown styling */
    body.dark-mode .dropdown-menu {
      background: ${DARK_MODE_COLORS.bgCard} !important;
      border-color: ${DARK_MODE_COLORS.borderColor} !important;
      box-shadow: 0 8px 32px ${DARK_MODE_COLORS.shadowDark} !important;
    }

    body.dark-mode .dropdown-item {
      color: ${DARK_MODE_COLORS.textPrimary} !important;
      transition: all 0.3s ease;
    }

    body.dark-mode .dropdown-item:hover {
      background: ${DARK_MODE_COLORS.bgHover} !important;
      color: ${DARK_MODE_COLORS.accentPrimary} !important;
    }

    body.dark-mode .dropdown-divider {
      background: ${DARK_MODE_COLORS.borderColor} !important;
    }

    /* User avatar */
    body.dark-mode .user-avatar {
      background: ${DARK_MODE_COLORS.bgHover} !important;
      color: ${DARK_MODE_COLORS.accentPrimary} !important;
    }

    body.dark-mode .user-avatar:hover {
      background: ${DARK_MODE_COLORS.accentPrimary} !important;
      color: ${DARK_MODE_COLORS.bgCard} !important;
    }

    /* Progress bars */
    body.dark-mode .savings-progress-bar-bg,
    body.dark-mode .savings-goal-progress-bar-bg {
      background: ${DARK_MODE_COLORS.bgHover} !important;
    }

    /* Sidebar links */
    body.dark-mode .sidebar-link {
      color: ${DARK_MODE_COLORS.textPrimary} !important;
      transition: all 0.3s ease;
    }

    body.dark-mode .sidebar-link:hover:not(.active) {
      background: ${DARK_MODE_COLORS.bgHover} !important;
      color: ${DARK_MODE_COLORS.accentPrimary} !important;
    }

    body.dark-mode .sidebar-link.active {
      background: linear-gradient(90deg, ${DARK_MODE_COLORS.accentPrimary} 60%, ${DARK_MODE_COLORS.accentSecondary} 100%) !important;
      color: ${DARK_MODE_COLORS.bgCard} !important;
    }

    /* Modal and overlay styling */
    body.dark-mode .modal,
    body.dark-mode .modal-content {
      background: ${DARK_MODE_COLORS.bgCard} !important;
      border-color: ${DARK_MODE_COLORS.borderColor} !important;
    }

    body.dark-mode .modal-header {
      border-bottom-color: ${DARK_MODE_COLORS.borderColor} !important;
    }

    body.dark-mode .modal-footer {
      border-top-color: ${DARK_MODE_COLORS.borderColor} !important;
    }

    /* Table styling */
    body.dark-mode table {
      background: ${DARK_MODE_COLORS.bgCard} !important;
    }

    body.dark-mode th,
    body.dark-mode td {
      border-color: ${DARK_MODE_COLORS.borderColor} !important;
      color: ${DARK_MODE_COLORS.textPrimary} !important;
    }

    body.dark-mode tr:hover {
      background: ${DARK_MODE_COLORS.bgHover} !important;
    }

    /* Scrollbar styling */
    body.dark-mode ::-webkit-scrollbar {
      width: 8px;
    }

    body.dark-mode ::-webkit-scrollbar-track {
      background: ${DARK_MODE_COLORS.bgSecondary} !important;
    }

    body.dark-mode ::-webkit-scrollbar-thumb {
      background: ${DARK_MODE_COLORS.borderColor} !important;
      border-radius: 4px;
    }

    body.dark-mode ::-webkit-scrollbar-thumb:hover {
      background: ${DARK_MODE_COLORS.accentPrimary} !important;
    }

    /* Status indicators */
    body.dark-mode .status-success {
      color: ${DARK_MODE_COLORS.success} !important;
    }

    body.dark-mode .status-warning {
      color: ${DARK_MODE_COLORS.warning} !important;
    }

    body.dark-mode .status-error {
      color: ${DARK_MODE_COLORS.error} !important;
    }

    body.dark-mode .status-info {
      color: ${DARK_MODE_COLORS.info} !important;
    }

    /* Enhanced transitions */
    body.dark-mode * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
  `;

  const style = document.createElement('style');
  style.id = 'enhanced-dark-styles';
  style.textContent = enhancedStyles;
  document.head.appendChild(style);
}

// Function to remove enhanced dark mode styles
function removeEnhancedDarkModeStyles() {
  const enhancedStyles = document.getElementById('enhanced-dark-styles');
  if (enhancedStyles) {
    enhancedStyles.remove();
  }
}

// Function to get current theme from localStorage
function getCurrentTheme() {
  return localStorage.getItem('theme') || 'light';
}

// Function to set theme in localStorage
function setTheme(theme) {
  localStorage.setItem('theme', theme);
}

// Function to initialize theme on page load
function initializeTheme() {
  const theme = getCurrentTheme();
  const isDark = theme === 'dark';
  applyDarkMode(isDark);
  updateThemeToggleIcon(isDark);
}

// Function to toggle dark mode
function toggleDarkMode() {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  const isDark = newTheme === 'dark';
  
  setTheme(newTheme);
  applyDarkMode(isDark);
  updateThemeToggleIcon(isDark);
}

// Function to update the theme toggle icon
function updateThemeToggleIcon(isDark) {
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
    toggleBtn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
}

// Function to create and add theme toggle button with enhanced styling
function createThemeToggle() {
  // Check if toggle already exists
  if (document.getElementById('themeToggle')) {
    return;
  }

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'themeToggle';
  toggleBtn.className = 'theme-toggle';
  toggleBtn.textContent = getCurrentTheme() === 'dark' ? '☀️' : '🌙';
  
  // Add click event
  toggleBtn.addEventListener('click', toggleDarkMode);
  
  // Enhanced styling for the toggle button
  const toggleStyles = `
    .theme-toggle {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #ddd;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .theme-toggle:hover {
      background: rgba(240, 240, 240, 0.9);
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }

    body.dark-mode .theme-toggle {
      background: rgba(45, 45, 45, 0.9);
      border-color: #555;
      color: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    body.dark-mode .theme-toggle:hover {
      background: rgba(60, 60, 60, 0.9);
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    }
  `;

  // Add styles if not already present
  if (!document.getElementById('theme-toggle-styles')) {
    const style = document.createElement('style');
    style.id = 'theme-toggle-styles';
    style.textContent = toggleStyles;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toggleBtn);
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();
  createThemeToggle();
});

// Export functions for use in other scripts
window.themeManager = {
  applyDarkMode,
  initializeTheme,
  toggleDarkMode,
  getCurrentTheme,
  setTheme,
  updateThemeToggleIcon,
  createThemeToggle,
  DARK_MODE_COLORS
}; 