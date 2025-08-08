const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const socketIo = require('socket.io');

// Import models
const User = require('./models/User');
const EMI = require('./models/EMI');
const Expense = require('./models/Expense');
const Debt = require('./models/Debt');
const Savings = require('./models/Savings');

// Import utilities
const { calculateDashboardTotals, getCachedTotals } = require('./utils/totalsCalculator');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/expense_tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, '❌ MongoDB connection error:'));
db.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware with MongoDB store for persistence
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/expense_tracker',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 24 hours
  }),
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Helper function to emit totals updates
function emitTotalsUpdate(userId) {
  try {
    getCachedTotals(userId).then(totals => {
      io.emit(`totalsUpdated:${userId}`, totals);
    }).catch(err => {
      console.error('Error emitting totals update:', err);
    });
  } catch (error) {
    console.error('Error in emitTotalsUpdate:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// ✅ REGISTER endpoint
app.post('/register', async (req, res) => {
  const { name, email, mobile, occupation, salary, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: '❌ Passwords do not match' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: '❌ Email already registered' });
    }

    const newUser = new User({ name, email, mobile, occupation, salary, password });
    await newUser.save();
    res.status(200).json({ message: '✅ User registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to register user' });
  }
});

// ✅ LOGIN endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: '❌ Invalid email or password' });
    }

    // Store user in session
    req.session.userId = user._id;
    req.session.user = {
      name: user.name,
      email: user.email,
      occupation: user.occupation,
      salary: user.salary
    };

    res.status(200).json({
      message: '✅ Login successful',
      user: {
        name: user.name,
        email: user.email,
        occupation: user.occupation,
        salary: user.salary
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Server error during login' });
  }
});

// ✅ FETCH CURRENT USER DATA
app.get('/api/current-user', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '❌ Not logged in' });
    }

    const user = await User.findById(req.session.userId, { password: 0 });
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to fetch user data' });
  }
});

// ✅ LOGOUT endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: '❌ Error logging out' });
    }
    res.status(200).json({ message: '✅ Logged out successfully' });
  });
});

// ✅ UPDATE PROFILE endpoint
app.put('/api/update-profile', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '❌ Not logged in' });
    }

    const { name, email, mobile, occupation, salary } = req.body;
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.session.userId } });
    if (existingUser) {
      return res.status(400).json({ message: '❌ Email already in use' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.session.userId,
      { name, email, mobile, occupation, salary },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: '❌ User not found' });
    }

    // Update session data
    req.session.user = {
      name: updatedUser.name,
      email: updatedUser.email,
      occupation: updatedUser.occupation,
      salary: updatedUser.salary
    };

    // Emit totals update
    emitTotalsUpdate(req.session.userId);

    res.status(200).json({
      message: '✅ Profile updated successfully',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        occupation: updatedUser.occupation,
        salary: updatedUser.salary
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to update profile' });
  }
});

// ✅ CHANGE PASSWORD endpoint
app.put('/api/change-password', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '❌ Not logged in' });
    }

    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: '❌ Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: '✅ Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to update password' });
  }
});

// ✅ FETCH REGISTERED USERS (for admin purposes)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // exclude password for safety
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to fetch users' });
  }
});

// ✅ DASHBOARD TOTALS endpoint
app.get('/api/dashboard/totals', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '❌ Not logged in' });
    }

    const totals = await getCachedTotals(req.session.userId);
    res.json(totals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to fetch dashboard totals' });
  }
});

// ✅ GET USER'S FINANCIAL DATA
app.get('/api/financial-data', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '❌ Not logged in' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }

    // If no financial data exists, initialize it
    if (!user.financialData || Object.keys(user.financialData).length === 0) {
      user.financialData = {
        monthlyIncome: user.salary || 0,
        // Initialize with sample data for charts
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
          { month: 'Jan', income: user.salary || 0, expense: 0 },
          { month: 'Feb', income: user.salary || 0, expense: 0 },
          { month: 'Mar', income: user.salary || 0, expense: 0 },
          { month: 'Apr', income: user.salary || 0, expense: 0 },
          { month: 'May', income: user.salary || 0, expense: 0 },
          { month: 'Jun', income: user.salary || 0, expense: 0 }
        ]
      };
      await user.save();
    }

    res.json(user.financialData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to fetch financial data' });
  }
});

// ✅ UPDATE USER'S FINANCIAL DATA
app.put('/api/financial-data', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '❌ Not logged in' });
    }

    const {
      totalExpense,
      totalEMI,
      totalDebt,
      totalSavings,
      monthlyIncome,
      expenseBreakdown,
      savingsHistory,
      incomeExpenseHistory
    } = req.body;

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }

    // Initialize financial data if it doesn't exist
    if (!user.financialData) {
      user.financialData = {};
    }

    // Update financial data fields
    if (totalExpense !== undefined) user.financialData.totalExpense = totalExpense;
    if (totalEMI !== undefined) user.financialData.totalEMI = totalEMI;
    if (totalDebt !== undefined) user.financialData.totalDebt = totalDebt;
    if (totalSavings !== undefined) user.financialData.totalSavings = totalSavings;
    if (monthlyIncome !== undefined) user.financialData.monthlyIncome = monthlyIncome;
    if (expenseBreakdown) user.financialData.expenseBreakdown = expenseBreakdown;
    if (savingsHistory) user.financialData.savingsHistory = savingsHistory;
    if (incomeExpenseHistory) user.financialData.incomeExpenseHistory = incomeExpenseHistory;
    
    // Update lastUpdated timestamp
    user.financialData.lastUpdated = new Date();

    await user.save();
    
    // Emit totals update
    emitTotalsUpdate(req.session.userId);
    
    res.json({ message: '✅ Financial data updated successfully', data: user.financialData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to update financial data' });
  }
});

// ✅ UPDATE SPECIFIC FINANCIAL FIELD
app.patch('/api/financial-data/:field', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '❌ Not logged in' });
    }

    const { field } = req.params;
    const { value } = req.body;

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: '❌ User not found' });
    }

    // Initialize financial data if it doesn't exist
    if (!user.financialData) {
      user.financialData = {};
    }

    // Update the specific field in financial data
    if (user.financialData.hasOwnProperty(field) || ['totalExpense', 'totalEMI', 'totalDebt', 'totalSavings', 'monthlyIncome', 'expenseBreakdown', 'savingsHistory', 'incomeExpenseHistory'].includes(field)) {
      user.financialData[field] = value;
      user.financialData.lastUpdated = new Date();
      await user.save();
      
      // Emit totals update
      emitTotalsUpdate(req.session.userId);
      
      res.json({ message: '✅ Field updated successfully', data: user.financialData });
    } else {
      res.status(400).json({ message: '❌ Invalid field name' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to update field' });
  }
});

// ✅ EMI API ROUTES

// GET all EMIs for the logged-in user
app.get('/api/emis', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '❌ Not logged in' });
    }

    const emis = await EMI.find({ userId: req.session.userId, isActive: true })
      .sort({ createdAt: -1 });

    res.json(emis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to fetch EMIs' });
  }
});

// POST new EMI
app.post('/api/emis', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '❌ Not logged in' });
    }

    const { loanType, amount, interestRate, tenure, startDate } = req.body;

    // Validate required fields
    if (!loanType || !amount || !interestRate || !tenure || !startDate) {
      return res.status(400).json({ message: '❌ All fields are required' });
    }

    // Create new EMI
    const newEMI = new EMI({
      userId: req.session.userId,
      loanType,
      amount: parseFloat(amount),
      interestRate: parseFloat(interestRate),
      tenure: parseInt(tenure),
      startDate: new Date(startDate)
    });

    await newEMI.save();

    // Emit totals update
    emitTotalsUpdate(req.session.userId);

    res.status(201).json({
      message: '✅ EMI added successfully',
      emi: newEMI
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to add EMI' });
  }
});

// DELETE EMI
app.delete('/api/emis/:id', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '❌ Not logged in' });
    }

    const { id } = req.params;

    const emi = await EMI.findOneAndUpdate(
      { _id: id, userId: req.session.userId },
      { isActive: false },
      { new: true }
    );

    if (!emi) {
      return res.status(404).json({ message: '❌ EMI not found' });
    }

    // Emit totals update
    emitTotalsUpdate(req.session.userId);

    res.json({ message: '✅ EMI deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to delete EMI' });
  }
});

// GET EMI statistics
app.get('/api/emis/stats', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '❌ Not logged in' });
    }

    const emis = await EMI.find({ userId: req.session.userId, isActive: true });

    const stats = {
      totalEMIs: emis.length,
      totalMonthlyPayment: emis.reduce((sum, emi) => sum + emi.monthlyPayment, 0),
      avgInterestRate: emis.length > 0 
        ? emis.reduce((sum, emi) => sum + emi.interestRate, 0) / emis.length 
        : 0
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Failed to fetch EMI statistics' });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
