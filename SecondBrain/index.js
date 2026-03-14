require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user');
const contentRoutes = require('./routes/content');
const { mongoose } = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Add Helmet for security holding and optimised caching headers
app.use(helmet());

// Apply rate limiting so the server doesn't lag on high traffic
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use('/api', apiLimiter);

// Compress all responses to load without any lag
app.use(compression());

app.use(cors({
    origin: function(origin, callback) {
        // Allow all origins for now to avoid CORS issues during initial deployment
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', userRoutes);
app.use('/api/v1', contentRoutes);
app.use('/api/v1', require('./routes/brain'));
app.use('/api/v1', require('./routes/project'));
app.use('/api/v1', require('./routes/assessment'));
app.use('/api/v1', require('./routes/resume'));

// Health check endpoint for Uptime Monitors
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'active', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/secondbrain";

mongoose.connect(MONGO_URL).then(() => {
    console.log("MongoDB Connected successfully");
    
    // Start server unconditionally
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}...`);
    });
})
.catch((err) => {
    console.error("CRITICAL: MongoDB connection error:", err);
    // Exit with failure code so Render registers the crash
    process.exit(1); 
});

module.exports = app;
