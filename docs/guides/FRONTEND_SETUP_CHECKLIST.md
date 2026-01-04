# Frontend Setup - Quick Checklist

**Use this checklist while following [FRONTEND_SETUP.md](./FRONTEND_SETUP.md)**

---

## Pre-requisites
- [ ] Node.js 24 LTS+ installed (`node --version`)
- [ ] pnpm 10+ installed (`pnpm --version`)
- [ ] Git 2.40+ installed (`git --version`)

---

## Setup Steps

### 1. Project Creation
```bash
cd /Users/I504180/workspace/personal/ai/workout-buddy
pnpm create vite@latest client --template react-ts
cd client
```

### 2. Core Dependencies
```bash
pnpm add react-router-dom@latest axios@latest zustand@latest
pnpm add @mediapipe/tasks-vision@latest
pnpm add react-hook-form@latest zod@latest @hookform/resolvers@latest
pnpm add clsx@latest tailwind-merge@latest
pnpm add -D @types/node@latest
pnpm add -D vitest@latest @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest
pnpm add -D @vitest/ui@latest happy-dom@latest
```

### 3. TailwindCSS 4
```bash
pnpm add tailwindcss@latest @tailwindcss/vite@latest
```
- [ ] Update `vite.config.ts` with `tailwindcss()` plugin
- [ ] Update `src/index.css` with `@import "tailwindcss";`
- [ ] Test with TailwindCSS classes in `App.tsx`

### 4. ESLint + Prettier
```bash
pnpm add -D eslint@latest prettier@latest
pnpm add -D @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
pnpm add -D eslint-plugin-react@latest eslint-plugin-react-hooks@latest eslint-plugin-react-refresh@latest
pnpm add -D eslint-config-prettier@latest
```
- [ ] Create `.eslintrc.json`
- [ ] Create `.prettierrc`
- [ ] Create `.prettierignore`

### 5. Pre-commit Hooks
```bash
pnpm add -D husky@latest lint-staged@latest
pnpm exec husky init
pnpm exec husky install
chmod +x .husky/pre-commit
```
- [ ] Add `lint-staged` config to `package.json`
- [ ] Update `.husky/pre-commit`
- [ ] Test by staging and committing a file

### 6. TypeScript Configuration
- [ ] Update `tsconfig.json` with strict settings
- [ ] Update `tsconfig.node.json`
- [ ] Add path alias `@/*` → `./src/*`

### 7. Folder Structure
```bash
cd src
rm -f App.css assets/react.svg
mkdir -p features/{auth,camera,exercises,statistics,profile}/{components,hooks,services,store,types,__tests__}
mkdir -p shared/{components/{ui,layout,feedback},hooks,utils,constants,types,api}
mkdir -p pages
mkdir -p features/exercises/logic
```

### 8. React Router
- [ ] Create `src/routes.tsx`
- [ ] Update `src/main.tsx` with `RouterProvider`

### 9. Environment Variables
- [ ] Create `.env.example`
- [ ] Create `.env.local` (gitignored)
- [ ] Update `.gitignore`

### 10. Vitest Configuration
- [ ] Create `vitest.config.ts`
- [ ] Create `src/test/setup.ts`

### 11. Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "prepare": "cd .. && husky install client/.husky"
  }
}
```

### 12. Utility Files
- [ ] Create `src/shared/api/client.ts` (Axios instance with interceptors)
- [ ] Create `src/shared/utils/cn.ts` (Tailwind merge utility)
- [ ] Create `src/shared/constants/exercises.ts`

### 13. IDE Configuration
- [ ] Create `.vscode/settings.json` (format on save)
- [ ] Create `.vscode/extensions.json` (recommended extensions)
- [ ] Configure IntelliJ IDEA (if using):
  - Enable Prettier on save
  - Enable ESLint on save
  - Git hooks work automatically

---

## Verification Tests

Run these commands to verify everything works:

```bash
# 1. Development server
pnpm dev
# ✅ Opens http://localhost:5173 with TailwindCSS styled page

# 2. Linting
pnpm lint
# ✅ No errors

# 3. Formatting check
pnpm format:check
# ✅ All files properly formatted

# 4. Type checking
pnpm type-check
# ✅ No TypeScript errors

# 5. Tests
pnpm test:run
# ✅ All tests pass

# 6. Build
pnpm build
# ✅ Creates dist/ folder

# 7. Preview
pnpm preview
# ✅ Serves production build

# 8. Pre-commit hook
echo "const test = 'test'" > src/test.ts
git add src/test.ts
git commit -m "test: verify hook"
# ✅ Prettier and ESLint run automatically
```

---

## Final Checklist

- [ ] ✅ `pnpm dev` starts server successfully
- [ ] ✅ TailwindCSS classes render correctly
- [ ] ✅ Path alias `@/*` imports work
- [ ] ✅ TypeScript strict mode enabled
- [ ] ✅ ESLint catches errors (`no-explicit-any` rule works)
- [ ] ✅ Prettier formats code correctly
- [ ] ✅ Pre-commit hook runs on `git commit`
- [ ] ✅ IDE formats on save (VS Code or IntelliJ)
- [ ] ✅ Tests run with Vitest
- [ ] ✅ Production build works
- [ ] ✅ Feature-based folder structure created
- [ ] ✅ Environment variables load correctly

---

## Common Commands Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
pnpm type-check       # TypeScript check

# Testing
pnpm test             # Run tests (watch mode)
pnpm test:run         # Run tests once
pnpm test:ui          # Open Vitest UI
pnpm test:coverage    # Generate coverage report

# Dependencies
pnpm add <package>@latest       # Add production dependency
pnpm add -D <package>@latest    # Add dev dependency
pnpm update --latest            # Update all to latest
pnpm list --depth=0             # List installed packages
```

---

## Troubleshooting Quick Fixes

**Husky not working:**
```bash
chmod +x .husky/pre-commit
pnpm exec husky install
```

**Prettier + ESLint conflicts:**
```bash
# Ensure "prettier" is LAST in .eslintrc.json extends array
```

**TailwindCSS not working:**
```bash
# Check vite.config.ts has tailwindcss() plugin
# Check src/index.css has @import "tailwindcss";
```

**Path alias not working:**
```bash
# Restart TypeScript server in IDE
# Check tsconfig.json and vite.config.ts both have alias config
```

---

**Ready to start? Follow the detailed guide: [FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** 🚀
