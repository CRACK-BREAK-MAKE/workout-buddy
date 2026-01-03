# Frontend Setup Summary

**Quick Reference Guide** | **Last Updated:** 2026-01-03

---

## 📚 Documentation Files

| Document | Purpose |
|----------|---------|
| **[FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** | Complete step-by-step guide with code examples |
| **[FRONTEND_SETUP_CHECKLIST.md](./FRONTEND_SETUP_CHECKLIST.md)** | Quick checklist for tracking progress |
| This file | Visual summary and quick commands |

---

## 🎯 Tech Stack

```
React 19.2.3
├── Vite 7.2.7 (build tool)
├── TypeScript 5.7+ (type safety)
├── TailwindCSS 4.1 (@tailwindcss/vite plugin)
├── React Router 7 (routing)
├── Zustand 5 (state management)
├── Axios 1.13+ (HTTP client)
├── Zod 4.3+ (validation)
└── MediaPipe 0.10.22 (pose detection)

Development Tools
├── pnpm 10+ (package manager - 3x faster than npm)
├── ESLint 9+ (linting)
├── Prettier 3+ (formatting)
├── Husky 9+ (git hooks)
├── lint-staged 15+ (pre-commit)
└── Vitest 2+ (testing)
```

---

## 🚀 Quick Start (Copy-Paste Ready)

### 1️⃣ Create Project (2 minutes)

```bash
cd /Users/I504180/workspace/personal/ai/workout-buddy
pnpm create vite@latest client --template react-ts
cd client
```

### 2️⃣ Install All Dependencies (3 minutes)

```bash
# Core dependencies
pnpm add react-router-dom@latest axios@latest zustand@latest @mediapipe/tasks-vision@latest react-hook-form@latest zod@latest @hookform/resolvers@latest clsx@latest tailwind-merge@latest

# TailwindCSS 4
pnpm add tailwindcss@latest @tailwindcss/vite@latest

# Development dependencies
pnpm add -D @types/node@latest vitest@latest @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest @vitest/ui@latest happy-dom@latest

# ESLint + Prettier
pnpm add -D eslint@latest prettier@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest eslint-plugin-react@latest eslint-plugin-react-hooks@latest eslint-plugin-react-refresh@latest eslint-config-prettier@latest

# Pre-commit hooks
pnpm add -D husky@latest lint-staged@latest
```

### 3️⃣ Initialize Git Hooks (1 minute)

```bash
pnpm exec husky init
pnpm exec husky install
chmod +x .husky/pre-commit
```

### 4️⃣ Create Folder Structure (1 minute)

```bash
cd src
rm -f App.css assets/react.svg
mkdir -p features/{auth,camera,exercises,statistics,profile}/{components,hooks,services,store,types,__tests__}
mkdir -p shared/{components/{ui,layout,feedback},hooks,utils,constants,types,api}
mkdir -p pages features/exercises/logic
cd ..
```

---

## 📁 Final Folder Structure

```
client/
├── .husky/
│   └── pre-commit              # Pre-commit hook (Prettier + ESLint)
├── .vscode/
│   ├── settings.json           # VS Code settings (format on save)
│   └── extensions.json         # Recommended extensions
├── src/
│   ├── features/
│   │   ├── auth/               # Authentication
│   │   ├── camera/             # MediaPipe integration
│   │   ├── exercises/          # Exercise counting
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── logic/          # ⭐ Exercise algorithms here
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   └── __tests__/
│   │   ├── statistics/         # Dashboard & analytics
│   │   └── profile/            # User profile
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/             # Button, Input, Card, etc.
│   │   │   ├── layout/         # Header, Footer, Sidebar
│   │   │   └── feedback/       # Loading, Error, Toast
│   │   ├── hooks/              # useAuth, useMediaQuery, etc.
│   │   ├── utils/              # cn(), formatDate(), etc.
│   │   ├── constants/          # EXERCISE_TYPES, API_ROUTES
│   │   ├── types/              # Shared TypeScript types
│   │   └── api/                # ⭐ Axios client with interceptors
│   ├── pages/                  # Page components
│   ├── test/
│   │   └── setup.ts            # Vitest setup
│   ├── App.tsx
│   ├── main.tsx
│   ├── routes.tsx              # React Router config
│   └── index.css               # ⭐ @import "tailwindcss";
├── .env.example                # Environment template
├── .env.local                  # Local environment (gitignored)
├── .eslintrc.json              # ESLint config
├── .prettierrc                 # Prettier config
├── .prettierignore             # Prettier ignore
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # ⭐ Vite + TailwindCSS plugin
├── vitest.config.ts            # Vitest config
└── package.json                # ⭐ Scripts + lint-staged config
```

---

## ⚙️ Key Configuration Files

### 1. `vite.config.ts` (TailwindCSS 4 Plugin)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()], // ⭐ Add tailwindcss()
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: { port: 5173, host: true, open: true }
})
```

### 2. `src/index.css` (TailwindCSS 4 Import)

```css
/* ⭐ TailwindCSS 4 - Single import line */
@import "tailwindcss";
```

### 3. `package.json` (lint-staged)

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix --max-warnings 0"
    ],
    "*.{json,css,md}": ["prettier --write"]
  },
  "scripts": {
    "prepare": "cd .. && husky install client/.husky"
  }
}
```

### 4. `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec lint-staged
```

### 5. `.eslintrc.json`

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
    "prettier"  // ⭐ Must be LAST
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "react/prop-types": "off"
  }
}
```

---

## 🧪 Verification Commands

```bash
# 1. Development server
pnpm dev
# ✅ Opens http://localhost:5173

# 2. All checks pass
pnpm lint && pnpm format:check && pnpm type-check && pnpm test:run
# ✅ All green

# 3. Production build
pnpm build && pnpm preview
# ✅ Creates dist/ and serves at http://localhost:4173

# 4. Pre-commit hook
echo "const x = 'test'" > src/test.ts && git add . && git commit -m "test"
# ✅ Auto-formats and commits
```

---

## 🎨 Pre-commit Hook Flow

```
Developer runs: git commit -m "feat: add feature"
         ↓
   Husky triggers .husky/pre-commit
         ↓
   lint-staged runs on staged files only
         ↓
   ┌─────────────────────────────┐
   │  For *.{ts,tsx,js,jsx}:     │
   │  1. prettier --write         │ ← Auto-formats code
   │  2. eslint --fix             │ ← Auto-fixes linting issues
   └─────────────────────────────┘
         ↓
   ┌─────────────────────────────┐
   │  For *.{json,css,md}:       │
   │  1. prettier --write         │ ← Auto-formats
   └─────────────────────────────┘
         ↓
   Files automatically staged again
         ↓
   Commit proceeds ✅
```

**Works in:**
- ✅ Terminal (`git commit`)
- ✅ VS Code Git UI
- ✅ IntelliJ IDEA Git UI
- ✅ GitHub Desktop
- ✅ Any Git client

---

## 💡 Best Practices

### TypeScript
```typescript
// ✅ Good - Explicit types
const fetchUser = async (id: string): Promise<User> => { ... }

// ❌ Bad - Using 'any'
const fetchUser = async (id: any): Promise<any> => { ... }
```

### Imports with Path Alias
```typescript
// ✅ Good - Use @ alias
import { Button } from '@/shared/components/ui/Button'

// ❌ Bad - Relative paths
import { Button } from '../../../shared/components/ui/Button'
```

### Feature Organization
```typescript
// ✅ Good - Feature-based (all exercise code together)
features/exercises/
  ├── components/ExerciseCounter.tsx
  ├── logic/pushUpCounter.ts
  └── hooks/useExerciseCounter.ts

// ❌ Bad - Type-based (scattered across folders)
components/ExerciseCounter.tsx
utils/pushUpCounter.ts
hooks/useExerciseCounter.ts
```

### TailwindCSS with cn() Utility
```typescript
import { cn } from '@/shared/utils/cn'

// ✅ Good - Conditional classes with cn()
<button className={cn(
  'px-4 py-2 rounded',
  isActive && 'bg-blue-600 text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
  Click me
</button>

// ❌ Bad - String concatenation
<button className={
  'px-4 py-2 rounded ' + 
  (isActive ? 'bg-blue-600 text-white ' : '') +
  (isDisabled ? 'opacity-50 cursor-not-allowed' : '')
}>
```

---

## 🔥 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Pre-commit hook not running | `chmod +x .husky/pre-commit && pnpm exec husky install` |
| TailwindCSS classes not working | Check `@import "tailwindcss";` in `index.css` and `tailwindcss()` plugin in `vite.config.ts` |
| ESLint + Prettier conflicts | Ensure `"prettier"` is LAST in `.eslintrc.json` extends array |
| Path alias `@/*` not working | Restart TypeScript server in IDE, check `tsconfig.json` and `vite.config.ts` |
| Tests failing | Check `src/test/setup.ts` exists and `vitest.config.ts` is configured |

---

## 📊 Development Workflow

```
1. Create branch
   git checkout -b feature/camera-access

2. Write failing test (RED)
   pnpm test camera.test.ts
   # ❌ Test fails

3. Implement feature (GREEN)
   # Write minimal code to pass test
   pnpm test camera.test.ts
   # ✅ Test passes

4. Refactor (REFACTOR)
   # Improve code quality
   pnpm lint && pnpm type-check
   # ✅ All checks pass

5. Commit (automatic pre-commit runs)
   git add .
   git commit -m "feat(camera): add webcam access"
   # ✅ Prettier + ESLint run automatically

6. Push
   git push -u origin feature/camera-access
```

---

## 🎯 Next Steps After Setup

1. **Start dev server:** `pnpm dev`
2. **Create first feature:** Camera access with MediaPipe
3. **Follow TDD:** Write tests first, then implementation
4. **Commit often:** Use conventional commits

---

## 📞 Need Help?

- **Detailed Guide:** [FRONTEND_SETUP.md](./FRONTEND_SETUP.md)
- **Checklist:** [FRONTEND_SETUP_CHECKLIST.md](./FRONTEND_SETUP_CHECKLIST.md)
- **Architecture:** [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **Project Guidelines:** [../../CLAUDE.md](../../CLAUDE.md)

---

**Ready to build? 🚀**

```bash
cd client
pnpm dev
```

Then open http://localhost:5173 and start coding!
