# Workout Buddy 🏋️

AI-powered exercise counting app using computer vision (MediaPipe) to automatically count exercise reps through webcam.

![React](https://img.shields.io/badge/React-19.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Vite](https://img.shields.io/badge/Vite-7.2-purple) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-cyan)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20+ (LTS recommended)
- **pnpm**: v10+ (package manager)
- **Git**: Latest version

### Check Your Versions

```bash
node --version   # Should be v20+
pnpm --version   # Should be v10+
git --version    # Any recent version
```

### Install pnpm (if not installed)

```bash
npm install -g pnpm@latest
```

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/CRACK-BREAK-MAKE/workout-buddy.git
cd workout-buddy
```

### 2. Install Dependencies

```bash
# Install root dependencies (Husky, lint-staged)
pnpm install

# This automatically:
# ✅ Installs all dependencies
# ✅ Sets up pre-commit hooks
# ✅ Configures Git hooks
```

### 3. Start the Development Server

```bash
# From the root directory
pnpm dev:client

# Or navigate to client folder
cd client
pnpm dev
```

The app will be available at **http://localhost:7002** 🎉

---

## 📁 Project Structure

```
workout-buddy/
├── client/                 # React frontend (TypeScript + Vite)
│   ├── src/
│   │   ├── features/      # Feature-based architecture
│   │   ├── components/    # Shared components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── server/                 # FastAPI backend (coming soon)
├── docs/                   # Documentation & ADRs
│   ├── adr/               # Architecture Decision Records
│   ├── guides/            # Development guides
│   └── architecture/      # System architecture docs
├── .husky/                 # Git hooks (pre-commit)
├── package.json            # Root package (monorepo)
├── pnpm-workspace.yaml     # pnpm workspace config
└── README.md
```

---

## 🛠️ Available Commands

### Root Commands (run from root directory)

```bash
pnpm dev:client           # Start client dev server
pnpm build:client         # Build client for production
pnpm test:client          # Run client tests
pnpm lint:client          # Lint client code
pnpm format:client        # Format client code
pnpm type-check:client    # TypeScript type checking
```

### Client Commands (run from client/ directory)

```bash
pnpm dev                  # Start dev server
pnpm build                # Production build
pnpm preview              # Preview production build
pnpm test                 # Run tests in watch mode
pnpm test:run             # Run tests once
pnpm test:ui              # Open Vitest UI
pnpm lint                 # Run ESLint
pnpm lint:fix             # Fix ESLint errors
pnpm format               # Format with Prettier
pnpm format:check         # Check formatting
pnpm type-check           # TypeScript check (no emit)
```

---

## 🔧 Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write code
   - Add tests
   - Follow TypeScript strict mode (no `any` types!)

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat(client): add exercise counter"
   ```

   **Pre-commit hooks will automatically:**
   - ✅ Format code with Prettier
   - ✅ Lint code with ESLint
   - ✅ Check TypeScript types
   - ❌ Block commit if errors exist

4. **Push and create PR:**
   ```bash
   git push -u origin feature/your-feature-name
   gh pr create  # Or use GitHub UI
   ```

### Commit Message Format (Conventional Commits)

```
<type>(<scope>): <subject>

Types:
  feat:     New feature
  fix:      Bug fix
  docs:     Documentation
  style:    Formatting
  refactor: Code refactoring
  test:     Tests
  chore:    Maintenance

Examples:
  feat(exercises): add squat counter
  fix(camera): prevent memory leak
  docs(readme): update setup instructions
```

---

## 🧪 Testing

### Run Tests

```bash
# Watch mode (recommended for development)
pnpm test:client

# Run once (for CI)
pnpm test:run

# Open UI (visual test runner)
pnpm test:ui
```

### Writing Tests

Tests are colocated with features:

```typescript
// client/src/features/exercises/__tests__/counter.test.ts
import { describe, it, expect } from 'vitest';
import { calculateAngle } from '../utils';

describe('calculateAngle', () => {
  it('should calculate angle between three points', () => {
    const angle = calculateAngle(pointA, pointB, pointC);
    expect(angle).toBe(90);
  });
});
```

---

## 🎨 Code Style

### Automatic Formatting

Code is automatically formatted on commit via pre-commit hooks. You can also format manually:

```bash
pnpm format:client
```

### ESLint Rules

Key rules enforced:
- ❌ No `any` types (`@typescript-eslint/no-explicit-any`)
- ❌ No unused variables (`@typescript-eslint/no-unused-vars`)
- ✅ React 19 best practices
- ✅ Prettier integration

---

## 🐛 Troubleshooting

### Pre-commit Hooks Not Running

```bash
# Reinstall Husky
pnpm run prepare

# Verify hook is executable
chmod +x .husky/pre-commit

# Check Git hooks path
git config core.hooksPath  # Should be .husky/_
```

### pnpm Installation Issues

```bash
# Clear cache
pnpm store prune

# Delete node_modules and reinstall
rm -rf node_modules client/node_modules
pnpm install
```

### IDE Issues (VS Code / IntelliJ)

**VS Code:**
- Settings → Git: Enabled (check)
- Restart VS Code after installing Husky

**IntelliJ:**
- Settings → Version Control → Commit → Run Git hooks (check)
- Restart IDE after setup

### Port Already in Use

```bash
# Kill process on port 7002
lsof -ti:7002 | xargs kill -9

# Or use a different port
pnpm dev -- --port 3000
```

---

## 📚 Documentation

- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design & tech stack
- **[ADRs](docs/adr/)** - Architecture decision records
- **[Setup Guides](docs/guides/)** - Detailed setup instructions
- **[API Documentation](docs/architecture/API_ENDPOINTS.md)** - Backend API (coming soon)

---

## 🐳 Docker Support (Coming Soon)

Currently, the app runs locally for faster development. Docker support will be added when the backend is ready:

```bash
# Future commands
docker-compose up -d          # Start all services
docker-compose logs -f client # View client logs
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (following conventional commits)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Checklist

- [ ] ✅ Tests pass (`pnpm test:run`)
- [ ] ✅ Linting passes (`pnpm lint:client`)
- [ ] ✅ TypeScript compiles (`pnpm type-check:client`)
- [ ] ✅ Pre-commit hooks pass
- [ ] ✅ Code reviewed by at least 1 person

---

## 🔑 Environment Variables

### Client (.env.local)

Create `client/.env.local` for local development:

```bash
# API Configuration
WORKOUT_BUDDY_API_URL=http://localhost:7001/api/v1
WORKOUT_BUDDY_ENVIRONMENT=development

# Feature Flags
WORKOUT_BUDDY_ENABLE_ANALYTICS=false
```

**Note:** Never commit `.env.local` files!

---

## 📦 Tech Stack

### Frontend (Current)
- **React 19.2** - UI framework with new compiler
- **TypeScript 5.9** - Type safety
- **Vite 7.2** - Build tool & dev server
- **TailwindCSS 4.1** - Utility-first CSS
- **MediaPipe** - Pose detection (browser-side)
- **React Router 7** - Client-side routing
- **Zustand** - State management (lightweight)
- **Vitest** - Testing framework

### Backend (Coming Soon)
- **FastAPI 0.128** - Python web framework
- **PostgreSQL 18** - Database
- **SQLAlchemy 2.0** - ORM
- **Alembic** - Database migrations

### DevOps
- **pnpm** - Fast, disk-efficient package manager
- **Husky** - Git hooks
- **lint-staged** - Run linters on staged files
- **ESLint + Prettier** - Code quality & formatting

---

## 🌟 Features (MVP)

- [x] ✅ Camera & pose detection setup
- [x] ✅ Pre-commit hooks configured
- [ ] 🚧 Push-up counter
- [ ] 🚧 Jump rope counter
- [ ] 🚧 User authentication
- [ ] 🚧 Workout history
- [ ] 🚧 Statistics dashboard

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🆘 Need Help?

- **Issues:** [GitHub Issues](https://github.com/CRACK-BREAK-MAKE/workout-buddy/issues)
- **Discussions:** [GitHub Discussions](https://github.com/CRACK-BREAK-MAKE/workout-buddy/discussions)
- **Documentation:** [/docs](docs/)

---

**Built with ❤️ by the Workout Buddy team**
