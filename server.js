const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const { handleError } = require('./src/middlewares/errorHandler');
const { router: adminRouter } = require('./src/routes/api/admin');

// Load environment variables before any other code
dotenv.config();

// Check if JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

const app = express();

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./src/routes/api/auth'));
app.use('/api/agents', require('./src/routes/api/agents'));
app.use('/api/appointments',  require('./src/routes/api/appointments'));
app.use('/api/plans', require('./src/routes/api/plans'));
app.use('/api/notifications', require('./src/routes/api/notifications'));
app.use('/api/admin', adminRouter);

// Error handling middleware
app.use(handleError);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Don't exit the process in development
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});