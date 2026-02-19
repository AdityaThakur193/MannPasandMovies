# 🎬 MannPasandMovies - MERN Stack

A full-stack movie discovery platform built with **MongoDB, Express, React, and Node.js**. Search, filter, and manage your movie watchlist with personalized recommendations.

## ✨ Features

✅ **Movie Discovery** - Browse 200+ movies with real-time search  
✅ **Smart Filtering** - Filter by genre, year, rating, and sort options  
✅ **User Authentication** - Secure JWT-based login/signup  
✅ **Watchlist** - Save movies to watch later  
✅ **Reviews & Ratings** - Rate and review movies (5-star system)  
✅ **Personalized Recommendations** - AI-based suggestions for logged-in users  
✅ **Dark/Light Theme** - Toggle between dark and light modes  
✅ **Responsive Design** - Mobile-optimized UI  
✅ **Accessibility** - WCAG-compliant with ARIA labels and keyboard nav  
✅ **Performance** - Lazy-loaded images, rate limiting, CSP headers  

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool  
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Server framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Helmet** - Security headers
- **Express Rate Limit** - Request throttling

### External APIs
- **TMDb API** - Movie data (proxied through server)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account ([free tier](https://www.mongodb.com/cloud/atlas))
- TMDB API key ([free signup](https://www.themoviedb.org/settings/api))

### Installation

```bash
# 1. Clone repo
git clone https://github.com/yourusername/ManPasandMovies-MERN.git
cd ManPasandMovies-MERN

# 2. Install dependencies for both client and server
npm run install-all

# 3. Create environment files (copy from templates)
cp server/.env.example server/.env
cp client/.env.example client/.env

# 4. Fill in your API keys and database URI (see SETUP.md)
# 5. Start dev servers
npm run dev
```

Visit **http://localhost:5173** → Backend runs on **http://localhost:5000**

**For detailed setup, see [SETUP.md](./SETUP.md)**

---

## 📁 Project Structure

```
ManPasandMovies-MERN/
├── server/                    # Backend (Express + MongoDB)
│   ├── middleware/           # Auth middleware
│   ├── models/               # Mongoose schemas (User, Review, etc.)
│   ├── routes/               # API endpoints (/api/auth, /movies, etc.)
│   ├── server.js             # Express server entry
│   ├── package.json
│   └── .env                  # (NOT in git - use .env.example)
│
├── client/                    # Frontend (React + Vite)
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable components (MovieCard, Navbar, etc.)
│   │   ├── pages/            # Route pages (Home, MovieDetails, etc.)
│   │   ├── services/         # API services (tmdbService, authService, etc.)
│   │   ├── context/          # React context (AuthContext, MovieContext)
│   │   ├── styles/           # CSS files
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Vite entry point
│   ├── package.json
│   └── .env                  # (NOT in git - use .env.example)
│
├── SETUP.md                  # Detailed setup guide
├── CONTRIBUTING.md           # Contribution guidelines
├── .gitignore                # Git exclusions (includes .env)
├── .env.example              # Environment template (COMMIT THIS)
└── package.json              # Root scripts
```

---

## 📝 Available Scripts

### Root Level
```bash
npm run dev           # Start both server and client
npm run server        # Start server only (port 5000)
npm run client        # Start client only (port 5173)
npm run install-all   # Install deps for all packages
npm run build         # Build client for production
```

### Server
```bash
cd server
npm start             # Run production server
npm run dev           # Run with hot reload (nodemon)
```

### Client
```bash
cd client
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Lint code
```

---

## 🔐 Security Features

✅ **API Key Protection** - TMDB key never exposed to client (proxied via server)  
✅ **CORS Enabled** - Properly configured for safe cross-origin requests  
✅ **CSP Headers** - Content Security Policy prevents XSS attacks  
✅ **Rate Limiting** - 300 req/5min general, 50 searches/5min  
✅ **Password Hashing** - Bcrypt with salt rounds  
✅ **JWT Auth** - Stateless authentication with token validation  
✅ **.env Protection** - Secrets in .gitignore, never committed  

### Security Checklist

- [ ] Rotate TMDB key if ever exposed
- [ ] Change MongoDB password if accessed
- [ ] Use strong JWT_SECRET (20+ chars, random)
- [ ] Enable HTTPS in production
- [ ] Review CORS origins for production

---

## 🎨 UI/UX Highlights

- **Dark/Light Theme** - Toggle at any time
- **Search Bar** - Real-time movie search with debounce
- **Filter System** - Genre, year, rating, sort options
- **Movie Cards** - Responsive grid with hover effects
- **Watchlist** - Quick add/remove from cards
- **Reviews** - Write, edit, delete reviews on movie pages
- **Empty States** - Helpful messaging when no results
- **Loading States** - Skeleton screens and spinners
- **Error Boundaries** - Graceful error handling

---

## 📊 API Endpoints

### Auth
```
POST   /api/auth/register    - Create account
POST   /api/auth/login       - Login
POST   /api/auth/logout      - Logout
```

### Movies
```
GET    /api/movies/liked     - Get liked movies
POST   /api/movies/like      - Like a movie
DELETE /api/movies/like/:id  - Unlike a movie

GET    /api/movies/watchlist - Get watchlist
POST   /api/movies/watchlist - Add to watchlist
DELETE /api/movies/watchlist/:id - Remove from watchlist
```

### Reviews
```
GET    /api/reviews/movie/:id      - Get movie reviews
POST   /api/reviews                - Create review
PUT    /api/reviews/:id            - Update review
DELETE /api/reviews/:id            - Delete review
```

### TMDB Proxy (via server for security)
```
GET    /api/tmdb/search/movie              - Search movies
GET    /api/tmdb/movie/popular             - Popular movies
GET    /api/tmdb/movie/:id                 - Movie details
GET    /api/tmdb/movie/:id/videos          - Trailers
GET    /api/tmdb/movie/:id/credits         - Cast info
GET    /api/tmdb/genre/movie/list          - Genres
```

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
cd server && npm install && cd ../client && npm install
```

### MongoDB connection fails
- Check `MONGODB_URI` in `server/.env`
- Verify your IP is whitelisted in MongoDB Atlas
- Test connection string at https://mongodb.com

### TMDB API returns 401
- Verify `TMDB_API_KEY` is correct and active
- Check at https://www.themoviedb.org/settings/api

### CORS errors
- Ensure `VITE_API_URL` in `client/.env` matches server
- Check CORS config in `server/server.js`

---

## 📚 Learn More

- [SETUP.md](./SETUP.md) - Detailed setup and configuration
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [React Router Docs](https://reactrouter.com)
- [Express Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [TMDb API Docs](https://developers.themoviedb.org)

---

## 📄 License

MIT © 2024

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

**Built with ❤️ for movie lovers everywhere** 🎬

│   └── vite.config.js
│
├── server/                # Node.js backend
│   ├── middleware/       # Auth middleware
│   ├── models/           # Mongoose models (User, Review)
│   ├── routes/           # API routes (auth, users, movies, reviews)
│   ├── server.js         # Entry point
│   └── package.json
│
├── package.json          # Root package.json
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics

### Movies
- `GET /api/movies/liked` - Get liked movies
- `POST /api/movies/like` - Like a movie
- `DELETE /api/movies/like/:id` - Unlike a movie
- `GET /api/movies/watchlist` - Get watchlist
- `POST /api/movies/watchlist` - Add to watchlist
- `DELETE /api/movies/watchlist/:id` - Remove from watchlist

### Reviews
- `GET /api/reviews/:movieId` - Get reviews for a movie
- `POST /api/reviews` - Create a review
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

## 🌐 Environment Variables

### Server (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `TMDB_API_KEY` - TMDb API key
- `NODE_ENV` - Environment (development/production)

### Client (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_TMDB_API_KEY` - TMDb API key

## 🚀 Deployment

### Backend (Render/Heroku/Railway)
1. Set environment variables
2. Deploy from Git repository
3. Ensure MongoDB connection string is set

### Frontend (Vercel/Netlify)
1. Build command: `npm run build`
2. Publish directory: `client/dist`
3. Set environment variables

## 📝 Getting TMDb API Key

1. Go to https://www.themoviedb.org/signup
2. Create a free account
3. Go to Settings → API
4. Request an API Key (Developer)
5. Use the API Key in your `.env` files

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected API routes
- Input validation
- CORS configured

## 📱 Features to Test

1. Register a new account
2. Login with credentials
3. Browse and search movies
4. Like movies
5. Add movies to watchlist
6. Write reviews and ratings
7. Check user statistics
8. View recommendations
9. Logout and login again (data persists!)

## 🤝 Contributing

Feel free to fork and contribute!

## 📄 License

MIT License

---

**Made with ❤️ for movie lovers**
