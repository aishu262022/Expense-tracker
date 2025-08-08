/**
 * TotalsContext - Manages dashboard totals state and real-time updates
 * This provides a React-like context pattern for vanilla JavaScript
 */

class TotalsContext {
  constructor() {
    this.totals = {
      totalBalance: 0,
      totalSavingsGoal: 0,
      totalSavingsCurrent: 0,
      totalDebtAmount: 0,
      totalEMIAmount: 0,
      totalEMIMonthlyPayment: 0,
      totalExpenses: 0,
      monthlyIncome: 0,
      lastCalculated: null
    };
    
    this.listeners = [];
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    
    this.init();
  }
  
  /**
   * Initialize the context
   */
  init() {
    // Get user ID from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.userId = userData._id || userData.id;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Initialize Socket.IO connection
    this.initSocket();
    
    // Load initial totals
    this.loadTotals();
  }
  
  /**
   * Initialize Socket.IO connection
   */
  initSocket() {
    try {
      // Load Socket.IO client library dynamically
      if (typeof io === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
        script.onload = () => this.connectSocket();
        document.head.appendChild(script);
      } else {
        this.connectSocket();
      }
    } catch (error) {
      console.error('Error initializing Socket.IO:', error);
    }
  }
  
  /**
   * Connect to Socket.IO server
   */
  connectSocket() {
    try {
      this.socket = io('http://localhost:3000');
      
      this.socket.on('connect', () => {
        console.log('🔌 Connected to Socket.IO server');
        this.isConnected = true;
      });
      
      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from Socket.IO server');
        this.isConnected = false;
      });
      
      // Listen for totals updates
      if (this.userId) {
        this.socket.on(`totalsUpdated:${this.userId}`, (newTotals) => {
          console.log('📊 Received totals update:', newTotals);
          this.updateTotals(newTotals);
        });
      }
      
    } catch (error) {
      console.error('Error connecting to Socket.IO:', error);
    }
  }
  
  /**
   * Load totals from server
   */
  async loadTotals() {
    try {
      const response = await fetch('/api/dashboard/totals', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (response.ok) {
        const totals = await response.json();
        this.updateTotals(totals);
      } else {
        console.error('Failed to load totals:', response.status);
      }
    } catch (error) {
      console.error('Error loading totals:', error);
    }
  }
  
  /**
   * Update totals and notify listeners
   */
  updateTotals(newTotals) {
    this.totals = { ...this.totals, ...newTotals };
    this.notifyListeners();
  }
  
  /**
   * Get current totals
   */
  getTotals() {
    return { ...this.totals };
  }
  
  /**
   * Subscribe to totals updates
   */
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Notify all listeners of totals changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.totals);
      } catch (error) {
        console.error('Error in totals listener:', error);
      }
    });
  }
  
  /**
   * Refresh totals from server
   */
  async refreshTotals() {
    await this.loadTotals();
  }
  
  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  /**
   * Get formatted totals for display
   */
  getFormattedTotals() {
    return {
      totalBalance: this.formatCurrency(this.totals.totalBalance),
      totalSavingsGoal: this.formatCurrency(this.totals.totalSavingsGoal),
      totalSavingsCurrent: this.formatCurrency(this.totals.totalSavingsCurrent),
      totalDebtAmount: this.formatCurrency(this.totals.totalDebtAmount),
      totalEMIAmount: this.formatCurrency(this.totals.totalEMIAmount),
      totalEMIMonthlyPayment: this.formatCurrency(this.totals.totalEMIMonthlyPayment),
      totalExpenses: this.formatCurrency(this.totals.totalExpenses),
      monthlyIncome: this.formatCurrency(this.totals.monthlyIncome)
    };
  }
  
  /**
   * Calculate savings progress percentage
   */
  getSavingsProgress() {
    if (this.totals.totalSavingsGoal === 0) return 0;
    return Math.min((this.totals.totalSavingsCurrent / this.totals.totalSavingsGoal) * 100, 100);
  }
  
  /**
   * Get financial health status
   */
  getFinancialHealth() {
    const balance = this.totals.totalBalance;
    const debt = this.totals.totalDebtAmount;
    const savings = this.totals.totalSavingsCurrent;
    
    if (balance > 0 && debt === 0) return 'excellent';
    if (balance > 0 && debt < savings) return 'good';
    if (balance > 0) return 'fair';
    if (balance === 0) return 'neutral';
    return 'poor';
  }
  
  /**
   * Cleanup resources
   */
  destroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.listeners = [];
  }
}

// Create global instance
window.totalsContext = new TotalsContext();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TotalsContext;
}
