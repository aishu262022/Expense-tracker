const mongoose = require('mongoose');

const emiSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanType: {
    type: String,
    required: true,
    enum: ['Car', 'Home', 'Education', 'Personal', 'Business', 'Other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  tenure: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  monthlyPayment: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate monthly payment before saving
emiSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('interestRate') || this.isModified('tenure')) {
    const principal = this.amount;
    const rate = this.interestRate / 100 / 12; // Monthly interest rate
    const time = this.tenure;
    
    if (rate === 0) {
      this.monthlyPayment = principal / time;
    } else {
      this.monthlyPayment = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
    }
  }
  next();
});

module.exports = mongoose.model('EMI', emiSchema); 