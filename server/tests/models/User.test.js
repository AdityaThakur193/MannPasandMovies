const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      const user = await User.create(userData);

      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.avatar).toBe('T'); // First letter of name
    });

    it('should fail without required fields', async () => {
      const userData = {
        email: 'test@example.com'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with invalid email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with password less than 6 characters', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should lowercase and trim email', async () => {
      const userData = {
        name: 'Test User',
        email: '  TEST@EXAMPLE.COM  ',
        password: 'Password123'
      };

      const user = await User.create(userData);
      expect(user.email).toBe('test@example.com');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      const user = await User.create(userData);
      expect(user.password).not.toBe('Password123');
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash format
    });

    it('should not rehash password if not modified', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      });

      const originalHash = user.password;
      user.name = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('Password Comparison', () => {
    it('should correctly compare valid password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      const user = await User.create(userData);
      const isMatch = await user.comparePassword('Password123');
      expect(isMatch).toBe(true);
    });

    it('should reject invalid password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      const user = await User.create(userData);
      const isMatch = await user.comparePassword('WrongPass123');
      expect(isMatch).toBe(false);
    });
  });

  describe('User Methods', () => {
    it('should remove password from JSON response', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      const user = await User.create(userData);
      const userJSON = user.toJSON();

      expect(userJSON.password).toBeUndefined();
      expect(userJSON.name).toBe(userData.name);
      expect(userJSON.email).toBe(userData.email);
    });
  });

  describe('Watchlist and Liked Movies', () => {
    it('should add movie to watchlist', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      });

      user.watchlist.push({
        movieId: 12345,
        title: 'Test Movie',
        poster: '/poster.jpg'
      });

      await user.save();
      expect(user.watchlist).toHaveLength(1);
      expect(user.watchlist[0].movieId).toBe(12345);
    });

    it('should add movie to liked movies', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      });

      user.likedMovies.push({
        movieId: 67890,
        title: 'Liked Movie',
        poster: '/liked.jpg'
      });

      await user.save();
      expect(user.likedMovies).toHaveLength(1);
      expect(user.likedMovies[0].movieId).toBe(67890);
    });
  });
});
