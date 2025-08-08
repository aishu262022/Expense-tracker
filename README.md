# Pockit - Financial Management App

A comprehensive MERN stack application for personal financial management with real-time updates and persistent sessions.

## 🚀 Features

### Core Features
- **User Authentication**: Register, login, logout with persistent sessions
- **Dashboard**: Real-time financial overview with live updates
- **Expense Tracking**: Categorize and track daily expenses
- **EMI Manager**: Track loans and calculate monthly payments
- **Debt Tracker**: Monitor outstanding debts and payments
- **Savings Goals**: Set and track savings targets
- **Profile Management**: Update personal and financial information

### Advanced Features
- **Persistent Sessions**: Sessions survive server restarts using MongoDB storage
- **Real-time Updates**: Live dashboard updates using Socket.IO
- **Dashboard Totals API**: Aggregated financial data from all sources
- **Data Migration**: Automatic data association and cleanup
- **Caching**: Precomputed totals for better performance

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Express-Session** with connect-mongo for persistent sessions
- **Socket.IO** for real-time communication

### Frontend
- **Vanilla JavaScript** with modern ES6+ features
- **Chart.js** for data visualization
- **Responsive CSS** with dark/light theme support

### Database Models
- **User**: Authentication and profile data
- **EMI**: Loan and installment tracking
- **Expense**: Daily expense categorization
- **Debt**: Outstanding debt management
- **Savings**: Savings goals and progress

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Instructions

1. **Clone and Navigate**
   ```bash
   cd toggle[1]/toggle
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

4. **Run Data Migration** (First time only)
   ```bash
   node migrate-financial-data.js
   node migrate-data-associations.js
   ```

5. **Start the Server**
   ```bash
   node server.js
   ```

6. **Access the Application**
   - Open `http://localhost:3000` in your browser
   - Register a new account or login with existing credentials

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker
SESSION_SECRET=your-secret-key
```

### Database Connection
The app connects to MongoDB at `mongodb://127.0.0.1:27017/expense_tracker` by default.

## 📊 API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/current-user` - Get current user data

### Profile Management
- `PUT /api/update-profile` - Update user profile
- `PUT /api/change-password` - Change password

### Dashboard & Financial Data
- `GET /api/dashboard/totals` - Get aggregated dashboard totals
- `GET /api/financial-data` - Get user's financial data
- `PUT /api/financial-data` - Update financial data
- `PATCH /api/financial-data/:field` - Update specific field

### EMI Management
- `GET /api/emis` - Get user's EMIs
- `POST /api/emis` - Add new EMI
- `DELETE /api/emis/:id` - Delete EMI
- `GET /api/emis/stats` - Get EMI statistics

## 🔄 Real-time Features

### Socket.IO Events
- `totalsUpdated:userId` - Emitted when financial totals change
- Connection events for user tracking

### TotalsContext Integration
The frontend uses a custom TotalsContext for state management:
- Automatic totals calculation
- Real-time updates via Socket.IO
- Currency formatting
- Financial health indicators

## 📈 Dashboard Totals

The dashboard displays aggregated totals from all financial sources:

- **Total Balance**: Monthly income - expenses - EMIs
- **Total Savings Goal**: Sum of all savings targets
- **Total Savings Current**: Current savings amount
- **Total Debt Amount**: Outstanding debt balance
- **Total EMI Amount**: Total loan amount
- **Total EMI Monthly Payment**: Monthly EMI obligations
- **Total Expenses**: Current month expenses
- **Monthly Income**: User's monthly salary

## 🗄️ Data Migration

### Financial Data Migration
```bash
node migrate-financial-data.js
```
- Migrates old financial data structure to embedded format
- Preserves all existing data
- Updates user.financialData schema

### Data Association Migration
```bash
node migrate-data-associations.js
```
- Associates orphaned records with users
- Calculates precomputed totals
- Cleans up invalid records
- Ensures data integrity

## 🔒 Security Features

### Session Management
- Persistent sessions stored in MongoDB
- 24-hour session timeout
- Secure cookie configuration
- Session validation on all protected routes

### Data Protection
- Password validation (should be hashed in production)
- User-specific data isolation
- Input sanitization and validation
- Error handling without data exposure

## 🎨 UI/UX Features

### Theme Support
- Light and dark mode toggle
- Persistent theme preference
- Smooth transitions and animations
- Responsive design for all devices

### Interactive Elements
- Real-time dashboard updates
- Visual feedback for changes
- Progress indicators for savings
- Financial health status indicators

## 🚀 Performance Optimizations

### Caching Strategy
- Precomputed totals cached for 5 minutes
- Lazy loading of financial data
- Efficient database queries with aggregation
- Client-side state management

### Database Optimization
- Indexed queries for fast lookups
- Aggregation pipelines for totals
- Efficient data relationships
- Minimal database calls

## 🐛 Troubleshooting

### Common Issues

1. **"Not logged in" Error**
   - Clear browser cookies and localStorage
   - Restart the server
   - Check MongoDB connection

2. **Socket.IO Connection Issues**
   - Ensure server is running on port 3000
   - Check browser console for connection errors
   - Verify CORS configuration

3. **Database Connection Issues**
   - Ensure MongoDB is running
   - Check connection string
   - Verify database permissions

4. **Real-time Updates Not Working**
   - Check Socket.IO client library loading
   - Verify user authentication
   - Check browser console for errors

### Debug Mode
Enable debug logging by setting:
```javascript
console.log('Debug mode enabled');
```

## 📝 Development

### Adding New Features
1. Create new model in `models/` directory
2. Add routes in `server.js`
3. Update totals calculator if needed
4. Add frontend components
5. Test with real-time updates

### Code Structure
```
toggle/
├── models/           # Database models
├── utils/           # Utility functions
├── public/          # Frontend files
│   ├── css/         # Stylesheets
│   ├── js/          # JavaScript files
│   └── *.html       # HTML pages
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console logs
3. Verify all dependencies are installed
4. Ensure MongoDB is running

---

**Happy Financial Management! 💰**
