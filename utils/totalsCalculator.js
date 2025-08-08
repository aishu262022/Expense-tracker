const User = require('../models/User');
const EMI = require('../models/EMI');
const Expense = require('../models/Expense');
const Debt = require('../models/Debt');
const Savings = require('../models/Savings');

/**
 * Calculate dashboard totals for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Object containing all totals
 */
async function calculateDashboardTotals(userId) {
  try {
    // Get user's financial data
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate totals from different collections
    const [
      emiTotals,
      expenseTotals,
      debtTotals,
      savingsTotals
    ] = await Promise.all([
      // EMI totals
      EMI.aggregate([
        { $match: { userId: user._id, isActive: true } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalMonthlyPayment: { $sum: '$monthlyPayment' } } }
      ]),
      
      // Expense totals (current month)
      Expense.aggregate([
        { 
          $match: { 
            userId: user._id,
            date: { 
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
            }
          } 
        },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
      ]),
      
      // Debt totals
      Debt.aggregate([
        { $match: { userId: user._id, isActive: true } },
        { $group: { _id: null, totalAmount: { $sum: '$remainingAmount' } } }
      ]),
      
      // Savings totals
      Savings.aggregate([
        { $match: { userId: user._id, isActive: true } },
        { $group: { _id: null, totalTarget: { $sum: '$targetAmount' }, totalCurrent: { $sum: '$currentAmount' } } }
      ])
    ]);

    // Extract values from aggregation results
    const emiTotal = emiTotals.length > 0 ? emiTotals[0].totalAmount : 0;
    const emiMonthlyPayment = emiTotals.length > 0 ? emiTotals[0].totalMonthlyPayment : 0;
    const expenseTotal = expenseTotals.length > 0 ? expenseTotals[0].totalAmount : 0;
    const debtTotal = debtTotals.length > 0 ? debtTotals[0].totalAmount : 0;
    const savingsTarget = savingsTotals.length > 0 ? savingsTotals[0].totalTarget : 0;
    const savingsCurrent = savingsTotals.length > 0 ? savingsTotals[0].totalCurrent : 0;

    // Calculate total balance (income - expenses - EMIs)
    const monthlyIncome = user.salary || user.financialData?.monthlyIncome || 0;
    const totalBalance = monthlyIncome - expenseTotal - emiMonthlyPayment;

    // Update user's financial totals for caching
    const financialTotals = {
      totalBalance,
      totalSavingsGoal: savingsTarget,
      totalSavingsCurrent: savingsCurrent,
      totalDebtAmount: debtTotal,
      totalEMIAmount: emiTotal,
      totalEMIMonthlyPayment: emiMonthlyPayment,
      totalExpenses: expenseTotal,
      monthlyIncome,
      lastCalculated: new Date()
    };

    // Update user's financial totals
    await User.findByIdAndUpdate(userId, {
      'financialData.financialTotals': financialTotals
    });

    return financialTotals;

  } catch (error) {
    console.error('Error calculating dashboard totals:', error);
    throw error;
  }
}

/**
 * Get cached totals for a user (faster than recalculating)
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Object containing cached totals
 */
async function getCachedTotals(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.financialData?.financialTotals) {
      // If no cached totals, calculate them
      return await calculateDashboardTotals(userId);
    }

    const cached = user.financialData.financialTotals;
    const now = new Date();
    const lastCalculated = new Date(cached.lastCalculated);
    
    // If cached data is older than 5 minutes, recalculate
    if (now - lastCalculated > 5 * 60 * 1000) {
      return await calculateDashboardTotals(userId);
    }

    return cached;
  } catch (error) {
    console.error('Error getting cached totals:', error);
    throw error;
  }
}

module.exports = {
  calculateDashboardTotals,
  getCachedTotals
};
