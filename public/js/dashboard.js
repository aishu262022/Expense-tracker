// Dashboard utility functions for financial data management

// Initialize TotalsContext integration
let totalsContext = null;
let unsubscribeFromTotals = null;

// Function to initialize dashboard with TotalsContext
function initializeDashboard() {
  // Wait for TotalsContext to be available
  if (typeof window.totalsContext !== 'undefined') {
    totalsContext = window.totalsContext;
    
    // Subscribe to totals updates
    unsubscribeFromTotals = totalsContext.subscribe((totals) => {
      updateDashboardDisplay(totals);
    });
    
    // Initial update
    updateDashboardDisplay(totalsContext.getTotals());
    
    console.log('✅ Dashboard initialized with TotalsContext');
  } else {
    // Fallback: retry after a short delay
    setTimeout(initializeDashboard, 100);
  }
}

// Function to update dashboard display with new totals
function updateDashboardDisplay(totals) {
  try {
    const formattedTotals = totalsContext.getFormattedTotals();
    
    // Update dashboard cards
    updateDashboardCard('totalBalance', formattedTotals.totalBalance, totals.totalBalance);
    updateDashboardCard('totalSavings', formattedTotals.totalSavingsCurrent, totals.totalSavingsCurrent);
    updateDashboardCard('totalDebt', formattedTotals.totalDebtAmount, totals.totalDebtAmount);
    updateDashboardCard('totalEMI', formattedTotals.totalEMIAmount, totals.totalEMIAmount);
    updateDashboardCard('totalExpenses', formattedTotals.totalExpenses, totals.totalExpenses);
    updateDashboardCard('monthlyIncome', formattedTotals.monthlyIncome, totals.monthlyIncome);
    
    // Update savings progress
    updateSavingsProgress(totals);
    
    // Update financial health indicator
    updateFinancialHealth(totals);
    
    // Update last updated timestamp
    updateLastUpdated(totals.lastCalculated);
    
    console.log('📊 Dashboard updated with new totals');
  } catch (error) {
    console.error('❌ Error updating dashboard display:', error);
  }
}

// Function to update individual dashboard card
function updateDashboardCard(cardId, formattedValue, rawValue) {
  const cardElement = document.getElementById(cardId);
  if (cardElement) {
    const valueElement = cardElement.querySelector('.card-value');
    if (valueElement) {
      valueElement.textContent = formattedValue;
      
      // Add visual feedback for changes
      cardElement.classList.add('updated');
      setTimeout(() => {
        cardElement.classList.remove('updated');
      }, 1000);
    }
  }
}

// Function to update savings progress
function updateSavingsProgress(totals) {
  const progressElement = document.getElementById('savingsProgress');
  if (progressElement) {
    const progress = totalsContext.getSavingsProgress();
    progressElement.style.width = `${progress}%`;
    
    const progressText = document.getElementById('savingsProgressText');
    if (progressText) {
      progressText.textContent = `${Math.round(progress)}%`;
    }
  }
}

// Function to update financial health indicator
function updateFinancialHealth(totals) {
  const healthElement = document.getElementById('financialHealth');
  if (healthElement) {
    const health = totalsContext.getFinancialHealth();
    healthElement.className = `health-indicator ${health}`;
    healthElement.textContent = health.charAt(0).toUpperCase() + health.slice(1);
  }
}

// Function to update last updated timestamp
function updateLastUpdated(timestamp) {
  const lastUpdatedElement = document.getElementById('lastUpdated');
  if (lastUpdatedElement && timestamp) {
    const date = new Date(timestamp);
    lastUpdatedElement.textContent = `Last updated: ${date.toLocaleTimeString()}`;
  }
}

// Function to update financial data
async function updateFinancialData(data) {
  try {
    const response = await fetch('/api/financial-data', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Financial data updated:', result.message);
      
      // Refresh totals from context
      if (totalsContext) {
        await totalsContext.refreshTotals();
      }
      
      return result.data;
    } else {
      const error = await response.json();
      console.error('❌ Failed to update financial data:', error.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error updating financial data:', error);
    return null;
  }
}

// Function to update a specific field
async function updateFinancialField(field, value) {
  try {
    const response = await fetch(`/api/financial-data/${field}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ value })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Field updated:', result.message);
      
      // Refresh totals from context
      if (totalsContext) {
        await totalsContext.refreshTotals();
      }
      
      return result.data;
    } else {
      const error = await response.json();
      console.error('❌ Failed to update field:', error.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error updating field:', error);
    return null;
  }
}

// Function to add sample data for testing
async function addSampleData() {
  const sampleData = {
    totalExpense: 3500,
    totalEMI: 1200,
    totalDebt: 5000,
    totalSavings: 2500,
    monthlyIncome: 8000,
    expenseBreakdown: {
      rent: 1500,
      food: 800,
      transport: 400,
      utilities: 300,
      others: 500
    },
    savingsHistory: [
      { month: 'Jan', amount: 500 },
      { month: 'Feb', amount: 800 },
      { month: 'Mar', amount: 1200 },
      { month: 'Apr', amount: 1500 },
      { month: 'May', amount: 2000 },
      { month: 'Jun', amount: 2500 }
    ],
    incomeExpenseHistory: [
      { month: 'Jan', income: 8000, expense: 3200 },
      { month: 'Feb', income: 8000, expense: 3300 },
      { month: 'Mar', income: 8000, expense: 3100 },
      { month: 'Apr', income: 8000, expense: 3400 },
      { month: 'May', income: 8000, expense: 3000 },
      { month: 'Jun', income: 8000, expense: 3500 }
    ]
  };

  const result = await updateFinancialData(sampleData);
  if (result) {
    // Reload the page to show updated data
    window.location.reload();
  }
}

// Function to reset data to zero
async function resetFinancialData() {
  const resetData = {
    totalExpense: 0,
    totalEMI: 0,
    totalDebt: 0,
    totalSavings: 0,
    monthlyIncome: 0,
    expenseBreakdown: {
      rent: 0,
      food: 0,
      transport: 0,
      utilities: 0,
      others: 0
    },
    savingsHistory: [
      { month: 'Jan', amount: 0 },
      { month: 'Feb', amount: 0 },
      { month: 'Mar', amount: 0 },
      { month: 'Apr', amount: 0 },
      { month: 'May', amount: 0 },
      { month: 'Jun', amount: 0 }
    ],
    incomeExpenseHistory: [
      { month: 'Jan', income: 0, expense: 0 },
      { month: 'Feb', income: 0, expense: 0 },
      { month: 'Mar', income: 0, expense: 0 },
      { month: 'Apr', income: 0, expense: 0 },
      { month: 'May', income: 0, expense: 0 },
      { month: 'Jun', income: 0, expense: 0 }
    ]
  };

  const result = await updateFinancialData(resetData);
  if (result) {
    // Reload the page to show updated data
    window.location.reload();
  }
}

// Function to refresh totals manually
async function refreshTotals() {
  if (totalsContext) {
    await totalsContext.refreshTotals();
    console.log('🔄 Totals refreshed manually');
  }
}

// Cleanup function
function cleanupDashboard() {
  if (unsubscribeFromTotals) {
    unsubscribeFromTotals();
  }
  if (totalsContext) {
    totalsContext.destroy();
  }
}

// Export functions for use in other scripts
window.dashboardUtils = {
  updateFinancialData,
  updateFinancialField,
  addSampleData,
  resetFinancialData,
  refreshTotals,
  cleanupDashboard
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupDashboard); 