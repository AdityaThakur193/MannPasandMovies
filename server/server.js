const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Validate environment variables (skip in test mode)
if (process.env.NODE_ENV !== 'test') {
  const { validateEnv } = require('./config/validateEnv');
  validateEnv();
}

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const movieRoutes = require('./routes/movies');
const reviewRoutes = require('./routes/reviews');
const tmdbRoutes = require('./routes/tmdb');

// Initialize express app
const app = express();

// Initialize passport
require('./config/passport');

// Middleware
app.use(cors());
// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "https://www.youtube.com", "https://www.youtube-nocookie.com", "https://va.vercel-scripts.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "img-src": ["'self'", "data:", "https://image.tmdb.org", "https://i.ytimg.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "frame-src": ["https://www.youtube.com", "https://www.youtube-nocookie.com"],
      "connect-src": ["'self'", "https://api.themoviedb.org", "https://image.tmdb.org"]
    }
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Connect to MongoDB
console.log('🔄 Connecting to MongoDB...');
// Read and sanitize URI
const rawMongoUri = process.env.MONGODB_URI;
const mongoUri = typeof rawMongoUri === 'string' ? rawMongoUri.trim() : rawMongoUri;

// Basic validation for the URI scheme to give clearer errors early
function isValidMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return false;
  return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
}

if (!isValidMongoUri(mongoUri)) {
  console.error('❌ MongoDB Connection Error: MONGODB_URI is missing or has an invalid scheme.');
  console.error('💡 It must start with "mongodb://" or "mongodb+srv://".');
  console.error('📌 Current value (trimmed):', typeof mongoUri === 'string' ? mongoUri.substring(0, 60) + (mongoUri.length > 60 ? '...' : '') : mongoUri);
  console.error('💡 Check your MONGODB_URI in server/.env file and restart the server.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    try {
      console.log('📊 Database:', mongoose.connection.db.databaseName);
      console.log('🌐 Host:', mongoose.connection.host);
    } catch (e) {
      // In some environments accessing db metadata may fail early; still continue
      console.log('📊 Connected (could not read DB metadata)');
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err && err.message ? err.message : err);
    console.error('💡 Check your MONGODB_URI in server/.env file');
    console.error('💡 Make sure your IP is whitelisted in MongoDB Atlas if using Atlas');
    process.exit(1);
  });

// MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB Disconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tmdb', tmdbRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}/api`);
  console.log(`📍 Network: http://${getLocalIP()}:${PORT}/api`);
  console.log(`💡 Use the Network URL for mobile testing`);
});

// Helper function to get local IP
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}
