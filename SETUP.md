# 🛠️ MannPasandMovies - Detailed Setup & Configuration Guide

This guide walks you through setting up MongoDB Atlas, acquiring your TMDB API credentials, configuring Google OAuth 2.0, and launching the full-stack **MannPasandMovies** application.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Database Setup (MongoDB Atlas)](#2-database-setup-mongodb-atlas)
3. [Movie API Setup (TMDB)](#3-movie-api-setup-tmdb)
4. [Authentication Setup (Google OAuth 2.0)](#4-authentication-setup-google-oauth-20)
5. [Local Environment Configuration](#5-local-environment-configuration)
6. [Launching the Application](#6-launching-the-application)
7. [Running Tests](#7-running-tests)
8. [Production Deployment](#8-production-deployment)

---

## 1. Prerequisites

- **Node.js**: v16.x or higher (v18.x / v20.x LTS recommended)
- **npm**: v8.x or higher
- **Git**
- A free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- A free developer account on [The Movie Database (TMDB)](https://www.themoviedb.org/)

---

## 2. Database Setup (MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Security → Database Access**, create a database user with read/write permissions.
3. Under **Security → Network Access**, add your current IP address (or `0.0.0.0/0` for development).
4. Click **Connect → Drivers** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/mannpasandmovies?retryWrites=true&w=majority
   ```

---

## 3. Movie API Setup (TMDB)

1. Sign up for a free account at [TheMovieDB.org](https://www.themoviedb.org/signup).
2. Go to **Settings → API** and click **Create → Developer**.
3. Accept the terms and fill out the basic application details.
4. Copy your **API Key (v3 auth)**.

---

## 4. Authentication Setup (Google OAuth 2.0)

*(Optional for local email/password testing, required for Google Login)*

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `MannPasandMovies`.
3. Go to **APIs & Services → Credentials**.
4. Click **Create Credentials → OAuth client ID** (Application type: **Web application**).
5. Add Authorized Redirect URIs:
   - Development: `http://localhost:5001/api/auth/google/callback`
   - Production: `https://your-backend-domain.com/api/auth/google/callback`
6. Copy the **Client ID** and **Client Secret**.

---

## 5. Local Environment Configuration

Clone the repository and install all dependencies:
```bash
git clone https://github.com/AdityaThakur193/ManPasandMovies-MERN.git
cd ManPasandMovies-MERN
npm run install-all
```

### Configure Server Environment (`server/.env`)
Create `server/.env` and paste your credentials:
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mannpasandmovies?retryWrites=true&w=majority
JWT_SECRET=generate_a_random_32_character_secret_key_here_12345
JWT_EXPIRATION=30d
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5001
```

### Configure Client Environment (`client/.env`)
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/w500
```

---

## 6. Launching the Application

### Option A: Windows Launcher (One-Click)
Double-click `run.bat` or run:
```cmd
.\run.bat
```

### Option B: npm CLI (Cross-Platform)
```bash
npm run dev
```

- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5001/api](http://localhost:5001/api)

---

## 7. Running Tests

```bash
# Backend Jest & Supertest Suite (36 tests)
cd server
npm test

# Frontend Vitest Suite (41 tests)
cd ../client
npm test
```

---

## 8. Production Deployment

### Frontend (Vercel / Netlify)
- **Build Command:** `npm run build`
- **Output Directory:** `client/dist`
- **Environment Variables:** `VITE_API_URL`, `VITE_TMDB_API_KEY`

### Backend (Render / Railway / AWS)
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Environment Variables:** Add all variables defined in `server/.env`
