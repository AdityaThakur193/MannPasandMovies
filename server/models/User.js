const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if googleId is not present
      return !this.googleId;
    },
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(v) {
        // Skip validation if no password (Google OAuth user)
        if (!v) return true;
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
      },
      message: 'Password must contain at least 8 characters, including uppercase, lowercase, and numbers'
    },
    select: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  avatar: {
    type: String,
    default: function() {
      return this.name ? this.name.charAt(0).toUpperCase() : '👤';
    }
  },
  likedMovies: [{
    movieId: { type: Number, required: true },
    title: String,
    poster: String,
    addedAt: { type: Date, default: Date.now }
  }],
  watchlist: [{
    movieId: { type: Number, required: true },
    title: String,
    poster: String,
    addedAt: { type: Date, default: Date.now }
  }],
  searchHistory: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Skip password hashing if not modified or if user is OAuth user
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'watchlist.movieId': 1 });
userSchema.index({ 'likedMovies.movieId': 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
