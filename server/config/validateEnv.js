/**
 * Environment Variable Validation
 * Validates required environment variables on server startup
 */

const requiredEnvVars = {
  // Critical variables
  JWT_SECRET: {
    required: true,
    minLength: 32,
    description: 'JWT secret key for token signing'
  },
  MONGODB_URI: {
    required: true,
    validate: (value) => {
      return value.startsWith('mongodb://') || value.startsWith('mongodb+srv://');
    },
    description: 'MongoDB connection URI'
  },
  NODE_ENV: {
    required: true,
    allowedValues: ['development', 'production', 'test'],
    description: 'Node environment'
  },
  // Google OAuth (optional for local development, required for OAuth feature)
  GOOGLE_CLIENT_ID: {
    required: false,
    description: 'Google OAuth Client ID'
  },
  GOOGLE_CLIENT_SECRET: {
    required: false,
    description: 'Google OAuth Client Secret'
  },
  CLIENT_URL: {
    required: false,
    default: 'http://localhost:5173',
    description: 'Frontend URL for OAuth redirects'
  },
  // Optional but recommended
  PORT: {
    required: false,
    default: 5000,
    validate: (value) => !isNaN(value) && value > 0 && value < 65536,
    description: 'Server port number'
  }
};

/**
 * Validates all required environment variables
 * @throws {Error} If validation fails
 */
function validateEnv() {
  const errors = [];
  const warnings = [];

  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];

    // Check if required variable is missing
    if (config.required && !value) {
      errors.push(`Missing required environment variable: ${key} - ${config.description}`);
      continue;
    }

    // Skip validation if optional and not provided
    if (!config.required && !value) {
      if (config.default) {
        process.env[key] = config.default;
        warnings.push(`Using default value for ${key}: ${config.default}`);
      }
      continue;
    }

    // Validate minimum length
    if (config.minLength && value.length < config.minLength) {
      errors.push(
        `${key} must be at least ${config.minLength} characters long. ` +
        `Current length: ${value.length}`
      );
    }

    // Validate allowed values
    if (config.allowedValues && !config.allowedValues.includes(value)) {
      errors.push(
        `${key} must be one of: ${config.allowedValues.join(', ')}. ` +
        `Current value: ${value}`
      );
    }

    // Run custom validation
    if (config.validate && !config.validate(value)) {
      errors.push(`${key} validation failed - ${config.description}`);
    }
  }

  // Additional required checks in production
  if (process.env.NODE_ENV === 'production') {
    const prodRequired = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'CLIENT_URL', 'SERVER_URL'];
    prodRequired.forEach((key) => {
      if (!process.env[key]) {
        errors.push(`Missing required environment variable in production: ${key}`);
      }
    });
  }

  // Display warnings
  if (warnings.length > 0) {
    console.log('⚠️  Environment Warnings:');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }

  // Throw error if validation failed
  if (errors.length > 0) {
    console.error('❌ Environment Validation Failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    console.error('\n💡 Create a .env file in the server directory with the required variables.');
    console.error('   See .env.example for reference.\n');
    throw new Error('Environment validation failed');
  }

  console.log('✅ Environment variables validated successfully');
}

/**
 * Gets environment configuration with defaults
 */
function getConfig() {
  return {
    port: parseInt(process.env.PORT) || 5000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION || '30d',
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  };
}

module.exports = {
  validateEnv,
  getConfig,
};
