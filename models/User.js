const mongoose = require('mongoose');

const FinancialSchema = new mongoose.Schema({
  totalExpense: { type: Number, default: 0 },
  totalEMI: { type: Number, default: 0 },
  totalDebt: { type: Number, default: 0 },
  totalSavings: { type: Number, default: 0 },
  monthlyIncome: { type: Number, default: 0 },
  expenseBreakdown: { type: Object, default: {} },
  savingsHistory: { type: Array, default: [] },
  incomeExpenseHistory: { type: Array, default: [] },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobile: String,
  occupation: String,
  salary: Number,
  password: String,
  financialData: { type: FinancialSchema, default: () => ({}) }
});

module.exports = mongoose.model('User', UserSchema);
