const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const EMI = require('./models/EMI');
const Expense = require('./models/Expense');
const Debt = require('./models/Debt');
const Savings = require('./models/Savings');

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/expense_tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function migrateDataAssociations() {
  try {
    console.log('🔄 Starting data association migration...');
    
    const db = mongoose.connection;
    
    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to process`);
    
    let processedUsers = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        console.log(`\n👤 Processing user: ${user.email}`);
        
        // 1. Check and fix EMI associations
        const emisWithoutUserId = await EMI.find({ userId: { $exists: false } });
        if (emisWithoutUserId.length > 0) {
          console.log(`  📋 Found ${emisWithoutUserId.length} EMIs without userId, associating with ${user.email}`);
          await EMI.updateMany(
            { userId: { $exists: false } },
            { userId: user._id }
          );
        }
        
        // 2. Check and fix Expense associations
        const expensesWithoutUserId = await Expense.find({ userId: { $exists: false } });
        if (expensesWithoutUserId.length > 0) {
          console.log(`  📋 Found ${expensesWithoutUserId.length} Expenses without userId, associating with ${user.email}`);
          await Expense.updateMany(
            { userId: { $exists: false } },
            { userId: user._id }
          );
        }
        
        // 3. Check and fix Debt associations
        const debtsWithoutUserId = await Debt.find({ userId: { $exists: false } });
        if (debtsWithoutUserId.length > 0) {
          console.log(`  📋 Found ${debtsWithoutUserId.length} Debts without userId, associating with ${user.email}`);
          await Debt.updateMany(
            { userId: { $exists: false } },
            { userId: user._id }
          );
        }
        
        // 4. Check and fix Savings associations
        const savingsWithoutUserId = await Savings.find({ userId: { $exists: false } });
        if (savingsWithoutUserId.length > 0) {
          console.log(`  📋 Found ${savingsWithoutUserId.length} Savings without userId, associating with ${user.email}`);
          await Savings.updateMany(
            { userId: { $exists: false } },
            { userId: user._id }
          );
        }
        
        // 5. Calculate and store precomputed totals
        const { calculateDashboardTotals } = require('./utils/totalsCalculator');
        const totals = await calculateDashboardTotals(user._id);
        
        console.log(`  ✅ Calculated totals for ${user.email}:`);
        console.log(`     Balance: ₹${totals.totalBalance}`);
        console.log(`     Savings Goal: ₹${totals.totalSavingsGoal}`);
        console.log(`     Debt: ₹${totals.totalDebtAmount}`);
        console.log(`     EMI: ₹${totals.totalEMIAmount}`);
        console.log(`     Expenses: ₹${totals.totalExpenses}`);
        
        processedUsers++;
        
      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error);
        errors++;
      }
    }
    
    // 6. Clean up orphaned records (records without valid userId)
    console.log('\n🧹 Cleaning up orphaned records...');
    
    const validUserIds = users.map(u => u._id);
    
    const orphanedEmis = await EMI.find({ userId: { $nin: validUserIds } });
    if (orphanedEmis.length > 0) {
      console.log(`  🗑️  Removing ${orphanedEmis.length} orphaned EMI records`);
      await EMI.deleteMany({ userId: { $nin: validUserIds } });
    }
    
    const orphanedExpenses = await Expense.find({ userId: { $nin: validUserIds } });
    if (orphanedExpenses.length > 0) {
      console.log(`  🗑️  Removing ${orphanedExpenses.length} orphaned Expense records`);
      await Expense.deleteMany({ userId: { $nin: validUserIds } });
    }
    
    const orphanedDebts = await Debt.find({ userId: { $nin: validUserIds } });
    if (orphanedDebts.length > 0) {
      console.log(`  🗑️  Removing ${orphanedDebts.length} orphaned Debt records`);
      await Debt.deleteMany({ userId: { $nin: validUserIds } });
    }
    
    const orphanedSavings = await Savings.find({ userId: { $nin: validUserIds } });
    if (orphanedSavings.length > 0) {
      console.log(`  🗑️  Removing ${orphanedSavings.length} orphaned Savings records`);
      await Savings.deleteMany({ userId: { $nin: validUserIds } });
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully processed: ${processedUsers} users`);
    console.log(`❌ Errors: ${errors} users`);
    
    // 7. Final statistics
    console.log('\n📊 Final Statistics:');
    const finalStats = await Promise.all([
      User.countDocuments(),
      EMI.countDocuments(),
      Expense.countDocuments(),
      Debt.countDocuments(),
      Savings.countDocuments()
    ]);
    
    console.log(`  Users: ${finalStats[0]}`);
    console.log(`  EMIs: ${finalStats[1]}`);
    console.log(`  Expenses: ${finalStats[2]}`);
    console.log(`  Debts: ${finalStats[3]}`);
    console.log(`  Savings: ${finalStats[4]}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
migrateDataAssociations();
