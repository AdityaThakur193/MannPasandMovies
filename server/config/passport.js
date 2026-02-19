const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Construct full callback URL for production/development
const getCallbackURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use your deployed domain
    // SERVER_URL must be set in production environment variables
    const baseUrl = process.env.SERVER_URL || 'https://example.com';
    return `${baseUrl}/api/auth/google/callback`;
  }
  // In development, use localhost with current port
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/api/auth/google/callback`;
};

// Skip Google Strategy setup in test environment
if (process.env.NODE_ENV !== 'test' && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: getCallbackURL(),
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, return the user
            return done(null, user);
          }

          // Check if user exists with this email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // User exists with this email, link Google account
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.displayName.charAt(0).toUpperCase(),
        });

        done(null, user);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        done(error, null);
      }
    }
  )
);
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
