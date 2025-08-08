const mongoose = require('mongoose');

const savingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  targetDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['emergency', 'vacation', 'house', 'car', 'education', 'wedding', 'retirement', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
savingsSchema.index({ userId: 1, isActive: 1 });
savingsSchema.index({ userId: 1, targetDate: 1 });

// Virtual for progress percentage
savingsSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

// Ensure virtuals are included in JSON output
savingsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Savings', savingsSchema);
