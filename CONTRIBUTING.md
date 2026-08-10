# 🤝 Contributing to MannPasandMovies

Thank you for your interest in contributing to **MannPasandMovies**! We welcome contributions from developers of all skill levels. Whether you are fixing a bug, adding a new feature, improving documentation, or writing tests, your help is deeply appreciated.

---

## 📜 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Development Setup](#-development-setup)
- [Branching Strategy](#-branching-strategy)
- [Conventional Commits](#-conventional-commits)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Pull Request Checklist](#-pull-request-checklist)
- [Community & Support](#-community--support)

---

## 🌟 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and empathetic in all interactions across issues, pull requests, and discussions.

---

## 🛠️ Development Setup

### 1. Fork & Clone
```bash
git clone https://github.com/AdityaThakur193/ManPasandMovies-MERN.git
cd ManPasandMovies-MERN
```

### 2. Install All Dependencies
```bash
npm run install-all
```
*(This installs root, `client/`, and `server/` packages concurrently).*

### 3. Environment Configuration
Copy the template files:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Fill in your MongoDB connection string and TMDB API key in the respective `.env` files.

### 4. Start Development Servers
- **Windows:** Double-click `run.bat` or run `.\run.bat`
- **Cross-Platform:** `npm run dev` (starts Frontend on `http://localhost:3000` and Backend on `http://localhost:5001/api`).

---

## 🌿 Branching Strategy

Always create a new feature branch from `main` using structured prefixes:

| Branch Prefix | Purpose | Example |
| :--- | :--- | :--- |
| `feature/` | New user-facing feature or enhancement | `feature/trailer-hero-player` |
| `bugfix/` | Bug fix or error resolution | `bugfix/oauth-redirect-uri` |
| `perf/` | Performance optimization | `perf/debounce-search-query` |
| `refactor/` | Code structure refactoring with zero functional change | `refactor/movie-controller-mvc` |
| `test/` | Adding or updating automated test suites | `test/auth-modal-component` |
| `docs/` | Documentation, guides, or README updates | `docs/contributing-guidelines` |

```bash
git checkout -b feature/my-new-feature
```

---

## 💬 Conventional Commits

We enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification for a clean, automated changelog history:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Supported Commit Types

| Type | Description | Example |
| :--- | :--- | :--- |
| `feat` | A new user-facing feature | `feat(player): add interactive hero trailer player` |
| `fix` | A bug fix | `fix(auth): prevent token loss on OAuth redirect` |
| `perf` | A code change that improves performance | `perf(search): optimize TMDB debouncing to 300ms` |
| `refactor`| Code change that neither fixes a bug nor adds a feature | `refactor(server): extract route logic to controllers` |
| `test` | Adding missing tests or correcting existing tests | `test(navbar): add ARIA attribute assertions` |
| `docs` | Documentation only changes | `docs(readme): add system architecture flowchart` |
| `style` | Changes that do not affect the meaning of the code | `style(cards): format CSS tokens and variables` |
| `chore` | Build process or auxiliary tool changes | `chore(deps): update vite and vitest configurations` |

---

## 🧪 Testing & Quality Assurance

Before submitting any code, verify that all **77 automated tests** across both backend and frontend suites pass cleanly:

```bash
# 1. Run Backend Unit & Integration Tests (Jest)
cd server
npm test

# 2. Run Frontend Component & Service Tests (Vitest)
cd ../client
npm test
```

Ensure:
- ✅ Zero broken test cases.
- ✅ No console errors or unhandled promise rejections.
- ✅ Clean linter checks (`npm run lint` if configured).

---

## ✅ Pull Request Checklist

Before opening your Pull Request, double-check that you have:

- [ ] Forked the repository and created your branch from `main`.
- [ ] Added unit or integration tests for any new logic introduced.
- [ ] Run both `server` and `client` test suites and verified **100% pass rate**.
- [ ] Formatted commit messages following the Conventional Commits specification.
- [ ] Updated documentation (`README.md`, `SETUP.md`, code docstrings) if relevant.
- [ ] Verified that no secrets, `.env` files, or private keys are staged in git.

---

## 💬 Community & Support

- **Bug Reports & Features:** Open an issue on our [GitHub Issue Tracker](https://github.com/AdityaThakur193/ManPasandMovies-MERN/issues).
- **Maintainer:** [Aditya Thakur](https://github.com/AdityaThakur193)
- **LinkedIn:** [in/aditya-thakur193](https://www.linkedin.com/in/aditya-thakur193/)
- **Portfolio:** [adityathakur.me](https://adityathakur.me/)
- **Email:** `adityath2305@gmail.com`

Thank you for building **MannPasandMovies** with us! 🎬
