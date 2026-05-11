require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const sequelize = require("./config/sequelize.db");
require("./models/index"); // Load all models + associations

const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== SECURITY MIDDLEWARES ====================

// Helmet — secure HTTP headers
app.use(helmet());

// CORS — allow all origins in development
app.use(cors({
    origin: true,
    credentials: true
}));

// Rate limiting — auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per window
    message: { success: false, message: "Too many login attempts, try again later", errorCode: "RATE_LIMIT" }
});

// General rate limiter
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: { success: false, message: "Too many requests", errorCode: "RATE_LIMIT" }
});

app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==================== STATIC UPLOADS ====================
// CORP override so uploaded images can be embedded by the frontend on a different origin
// (e.g. dashboard served at 127.0.0.1:5500 while API runs at localhost:3000).
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
if (require.main === module) {
    try {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (err) {
        console.warn("Uploads directory creation skipped:", err.message);
    }
}

app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
}, express.static(UPLOADS_DIR));

// Request logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ==================== HEALTH CHECK ====================

app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({
            success: true,
            message: 'Server is healthy',
            data: {
                server: 'running',
                database: 'connected',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server unhealthy',
            data: { server: 'running', database: 'disconnected' }
        });
    }
});

// ==================== API ROUTES ====================

// v1 API routes (NEW — all versioned endpoints)
const v1Routes = require("./routes/v1");
app.use("/api/v1", v1Routes);

// Apply stricter rate limiting to auth routes
app.use("/api/v1/auth/login", authLimiter);

// ==================== LEGACY ROUTES (backward compatibility) ====================
// These will be deprecated — use /api/v1/ instead

try {
    const legacyAuthRoutes = require('./modules/auth/auth.routes');
    app.use('/api/auth', legacyAuthRoutes);
} catch (e) { /* skip if not found */ }

try {
    const legacyAdminRoutes = require('./modules/admin/admin.routes');
    app.use('/api/admin', legacyAdminRoutes);
} catch (e) { /* skip if not found */ }

// ==================== API INFO ====================

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'ExistingSky Backend API',
        version: 'v1.0',
        api: '/api/v1',
        health: '/health',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            banking: '/api/v1/banking',
            bets: '/api/v1/bets',
            matches: '/api/v1/matches',
            results: '/api/v1/results',
            reports: '/api/v1/reports',
            settings: '/api/v1/settings',
            messages: '/api/v1/messages',
            website: '/api/v1/website',
            permissions: '/api/v1/permissions',
            surveillance: '/api/v1/surveillance',
            companyPayment: '/api/v1/company-payment'
        }
    });
});

app.get('/api/v1', (req, res) => {
    res.json({
        success: true,
        message: 'ExistingSky API v1',
        version: '1.0.0',
        totalEndpoints: '120+',
        modules: [
            'auth', 'users', 'banking', 'bets', 'matches',
            'results', 'reports', 'settings', 'messages',
            'website', 'permissions', 'surveillance', 'company-payment'
        ]
    });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
        errorCode: 'NOT_FOUND'
    });
});

// Global error handler
app.use(errorHandler);

// ==================== DATABASE + PERMISSION CACHE + SERVER START ====================

const permissionCache = require('./services/permissionCache');

async function initialize() {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");
        await permissionCache.init();
    } catch (err) {
        console.error("Initialization Error:", err.message);
    }
}

// Call initialization
initialize();



if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}




process.on("unhandledRejection", (err) => {
    console.error("Unhandled Promise Rejection:", err);
});

module.exports = app;
