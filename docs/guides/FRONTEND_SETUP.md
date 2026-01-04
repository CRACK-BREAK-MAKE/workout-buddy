# Frontend Setup Guide - Complete End-to-End

**Last Updated:** 2026-01-03
**Target:** React 19 + Vite 7 + TypeScript 5.7+ + TailwindCSS 4 + pnpm 10
**Pre-commit:** Prettier + ESLint with Husky + lint-staged

---

## Overview

This guide provides complete step-by-step instructions to set up the Workout Buddy frontend application following the latest best practices from:
- ✅ [Prettier Pre-commit Hooks](https://prettier.io/docs/precommit)
- ✅ [Prettier + ESLint Integration](https://prettier.io/docs/integrating-with-linters)
- ✅ [TailwindCSS 4 with Vite](https://tailwindcss.com/docs/installation/using-vite)
- ✅ [Vite Setup Guide](https://vite.dev/guide/)

---

## Prerequisites

**Required:**
- Node.js 24 LTS+ (latest)
- pnpm 10+ (faster than npm/yarn)
- Git 2.40+

**Check versions:**
```bash
node --version  # Should be v24.x.x
pnpm --version  # Should be 10.x.x
git --version   # Should be 2.x.x
```

**Install pnpm if not installed:**
```bash
# macOS/Linux
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Windows
powershell -c "irm https://get.pnpm.io/install.ps1 | iex"

# Or via npm
npm install -g pnpm@latest

# Verify
pnpm --version
```

---

## Step 1: Create Vite Project

Navigate to your project root and create the client folder:

```bash
cd /Users/I504180/workspace/personal/ai/workout-buddy

# Create Vite project with React + TypeScript template
pnpm create vite@latest client --template react-ts

# Navigate to client folder
cd client
```

**What this does:**
- Creates `client/` folder with Vite + React + TypeScript
- Sets up `package.json`, `tsconfig.json`, `vite.config.ts`
- Creates basic React app structure (`src/main.tsx`, `src/App.tsx`)

---

## Step 2: Install Core Dependencies

Install all required packages with **latest versions**:

```bash
# Core dependencies
pnpm add react-router-dom@latest axios@latest zustand@latest

# MediaPipe for pose detection
pnpm add @mediapipe/tasks-vision@latest

# Form handling and validation
pnpm add react-hook-form@latest zod@latest @hookform/resolvers@latest

# Utility libraries
pnpm add clsx@latest tailwind-merge@latest

# Development dependencies
pnpm add -D @types/node@latest
pnpm add -D vitest@latest @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest
pnpm add -D @vitest/ui@latest happy-dom@latest
```

**Verify installation:**
```bash
pnpm list --depth=0
```

---

## Step 3: Install TailwindCSS 4 (Latest Method)

Following [TailwindCSS 4 with Vite guide](https://tailwindcss.com/docs/installation/using-vite):

```bash
# Install TailwindCSS 4 with Vite plugin (NEW approach)
pnpm add tailwindcss@latest @tailwindcss/vite@latest
```

**Configure Vite plugin:**

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add TailwindCSS Vite plugin
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true, // Auto-open browser
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mediapipe': ['@mediapipe/tasks-vision'],
        },
      },
    },
  },
})
```

**Import TailwindCSS in your CSS:**

Update `src/index.css`:
```css
/* TailwindCSS 4 - Single import line */
@import "tailwindcss";

/* Your custom styles below */
```

**Test TailwindCSS:**

Update `src/App.tsx` to verify:
```tsx
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-indigo-900 mb-4">
          Workout Buddy 💪
        </h1>
        <p className="text-lg text-gray-700">
          TailwindCSS 4 is working!
        </p>
      </div>
    </div>
  )
}

export default App
```

---

## Step 4: Install ESLint + Prettier

Following [Prettier + ESLint integration guide](https://prettier.io/docs/integrating-with-linters):

```bash
# Install ESLint and Prettier
pnpm add -D eslint@latest prettier@latest

# ESLint plugins for React and TypeScript
pnpm add -D @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
pnpm add -D eslint-plugin-react@latest eslint-plugin-react-hooks@latest eslint-plugin-react-refresh@latest

# eslint-config-prettier (turns off conflicting ESLint rules)
pnpm add -D eslint-config-prettier@latest
```

**Create ESLint configuration:**

Create `.eslintrc.json`:
```json
{
  "root": true,
  "env": {
    "browser": true,
    "es2020": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": [
    "react",
    "@typescript-eslint",
    "react-refresh"
  ],
  "rules": {
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "react/prop-types": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

**Create Prettier configuration:**

Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

**Create Prettier ignore file:**

Create `.prettierignore`:
```
# Build outputs
dist
build
.vite

# Dependencies
node_modules
pnpm-lock.yaml

# Environment
.env
.env.local
.env.production

# IDE
.vscode
.idea

# Logs
*.log
```

---

## Step 5: Set Up Pre-commit Hooks (Husky + lint-staged)

Following [Prettier pre-commit guide](https://prettier.io/docs/precommit), using **lint-staged** (recommended approach):

```bash
# Install Husky and lint-staged
pnpm add -D husky@latest lint-staged@latest

# Initialize Husky (creates .husky/ directory)
pnpm exec husky init

# Install Husky hooks
pnpm exec husky install
```

**Configure lint-staged:**

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix --max-warnings 0"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

**Create pre-commit hook:**

Update `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged (Prettier + ESLint on staged files)
pnpm exec lint-staged
```

**Make the hook executable:**
```bash
chmod +x .husky/pre-commit
```

**Optional: Add prepare script to package.json:**

This ensures Husky is installed when team members run `pnpm install`:

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

---

## Step 6: Configure TypeScript

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Update `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

---

## Step 7: Set Up Feature-Based Folder Structure

Create the feature-based architecture following SOLID principles:

```bash
cd src

# Remove default files
rm -f App.css assets/react.svg

# Create feature folders
mkdir -p features/{auth,camera,exercises,statistics,profile}/{components,hooks,services,store,types,__tests__}

# Create shared folders
mkdir -p shared/{components/{ui,layout,feedback},hooks,utils,constants,types,api}

# Create pages folder
mkdir -p pages

# Create exercise logic folder
mkdir -p features/exercises/logic
```

**Final structure:**
```
client/src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── __tests__/
│   ├── camera/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── __tests__/
│   ├── exercises/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── logic/           # Exercise counting algorithms
│   │   ├── store/
│   │   ├── types/
│   │   └── __tests__/
│   ├── statistics/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── __tests__/
│   └── profile/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── __tests__/
├── shared/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (Button, Input, etc.)
│   │   ├── layout/          # Layout components (Header, Footer, Sidebar)
│   │   └── feedback/        # Loading, Error, Toast components
│   ├── hooks/               # Shared custom hooks
│   ├── utils/               # Utility functions
│   ├── constants/           # Constants (API URLs, enums, etc.)
│   ├── types/               # Shared TypeScript types
│   └── api/                 # API client configuration
├── pages/                   # Page components
├── App.tsx
├── main.tsx
├── routes.tsx
└── index.css
```

---

## Step 8: Set Up React Router

Create `src/routes.tsx`:
```typescript
import { createBrowserRouter } from 'react-router-dom';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        lazy: () => import('./pages/HomePage'),
      },
      {
        path: 'login',
        lazy: () => import('./pages/LoginPage'),
      },
      {
        path: 'register',
        lazy: () => import('./pages/RegisterPage'),
      },
      {
        path: 'workout',
        lazy: () => import('./pages/WorkoutPage'),
      },
      {
        path: 'statistics',
        lazy: () => import('./pages/StatisticsPage'),
      },
      {
        path: 'profile',
        lazy: () => import('./pages/ProfilePage'),
      },
    ],
  },
]);
```

Update `src/main.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

---

## Step 9: Create Environment Variables

Create `.env.example`:
```bash
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development

# MediaPipe Configuration (optional)
VITE_MEDIAPIPE_MODEL_PATH=/models
```

Create `.env.local` (gitignored):
```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development
```

Update `.gitignore`:
```
# Environment variables
.env
.env.local
.env.production
.env.*.local
```

---

## Step 10: Configure Vitest for Testing

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Create `src/test/setup.ts`:
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

---

## Step 11: Update Package.json Scripts

Update your `package.json` scripts section:

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

---

## Step 12: Create Utility Files

### API Client (`src/shared/api/client.ts`)

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add JWT token)
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Tailwind Utilities (`src/shared/utils/cn.ts`)

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Constants (`src/shared/constants/exercises.ts`)

```typescript
export const EXERCISE_TYPES = {
  PUSH_UP: 'push-up',
  JUMP_ROPE: 'jump-rope',
} as const;

export type ExerciseType = typeof EXERCISE_TYPES[keyof typeof EXERCISE_TYPES];

export const EXERCISE_LABELS: Record<ExerciseType, string> = {
  [EXERCISE_TYPES.PUSH_UP]: 'Push-ups',
  [EXERCISE_TYPES.JUMP_ROPE]: 'Jump Rope',
};
```

---

## Step 13: IDE Configuration

### VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

Create `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "vitest.explorer"
  ]
}
```

### IntelliJ IDEA Configuration

1. **Enable Prettier:**
   - `Settings` → `Languages & Frameworks` → `JavaScript` → `Prettier`
   - Set Prettier package path: `{project}/client/node_modules/prettier`
   - Check "Run on save for files"
   - Set pattern: `{**/*,*}.{js,ts,jsx,tsx,css,json,md}`

2. **Enable ESLint:**
   - `Settings` → `Languages & Frameworks` → `JavaScript` → `Code Quality Tools` → `ESLint`
   - Check "Automatic ESLint configuration"
   - Check "Run eslint --fix on save"

3. **Configure Git Hooks:**
   - IntelliJ will automatically detect and run Git hooks
   - No additional configuration needed

---

## Step 14: Test Your Setup

### 1. Test Development Server
```bash
pnpm dev
```
- Visit http://localhost:5173
- Should see TailwindCSS styled page
- Hot reload should work

### 2. Test Linting
```bash
pnpm lint
# Should pass with no errors

pnpm format:check
# Should pass with no errors
```

### 3. Test Pre-commit Hook

Create a test file with intentional issues:
```bash
# Create a poorly formatted file
cat > src/test-file.ts << 'EOF'
const badFormatting={foo:"bar",baz:123};
console.log(badFormatting)
EOF

# Stage the file
git add src/test-file.ts

# Try to commit
git commit -m "test: verify pre-commit hook"
```

**Expected result:**
- Prettier should auto-format the file
- ESLint should check for issues
- File should be automatically fixed and staged
- Commit should succeed with properly formatted code

### 4. Test TypeScript
```bash
pnpm type-check
# Should pass with no errors
```

### 5. Test Build
```bash
pnpm build
# Should create dist/ folder
```

### 6. Test Production Preview
```bash
pnpm preview
# Should serve production build at http://localhost:4173
```

---

## Step 15: Create Sample Component (Optional)

Create a sample Button component to test the full setup:

**`src/shared/components/ui/Button.tsx`:**
```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500':
              variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500':
              variant === 'secondary',
            'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500':
              variant === 'outline',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

**`src/shared/components/ui/Button.test.tsx`:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies primary variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-indigo-600');
  });

  it('applies correct size classes', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByText('Large');
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });
});
```

**Test the component:**
```bash
pnpm test Button.test.tsx
```

---

## Verification Checklist

After completing all steps, verify:

- ✅ `pnpm dev` starts development server (http://localhost:5173)
- ✅ TailwindCSS classes work in components
- ✅ `pnpm lint` passes without errors
- ✅ `pnpm format:check` passes without errors
- ✅ `pnpm type-check` passes without errors
- ✅ `pnpm test` runs unit tests successfully
- ✅ `pnpm build` creates production build
- ✅ Git pre-commit hook runs Prettier + ESLint automatically
- ✅ VS Code/IntelliJ formats on save
- ✅ Path alias `@/*` works in imports
- ✅ Feature-based folder structure created
- ✅ Environment variables loaded correctly

---

## Troubleshooting

### Husky hooks not running

```bash
# Ensure hooks are executable
chmod +x .husky/pre-commit

# Reinstall Husky
pnpm exec husky install
```

### Prettier conflicts with ESLint

```bash
# Verify eslint-config-prettier is installed and in extends
pnpm list eslint-config-prettier

# Check .eslintrc.json has "prettier" as LAST item in extends array
```

### TailwindCSS not working

```bash
# Verify @tailwindcss/vite plugin is installed
pnpm list @tailwindcss/vite

# Check vite.config.ts has tailwindcss() in plugins array
# Check src/index.css has @import "tailwindcss";
```

### Path alias `@/*` not working

```bash
# Ensure tsconfig.json has baseUrl and paths configured
# Ensure vite.config.ts has resolve.alias configured
# Restart TypeScript server in IDE
```

---

## Next Steps

After frontend setup is complete:

1. ✅ Start development server: `pnpm dev`
2. ✅ Create your first feature: Camera access + MediaPipe integration
3. ✅ Follow TDD: Write tests first, then implementation
4. ✅ Commit regularly with conventional commits: `feat(camera): add webcam access`

---

## References

- [Vite Guide](https://vite.dev/guide/)
- [TailwindCSS 4 + Vite](https://tailwindcss.com/docs/installation/using-vite)
- [Prettier Pre-commit Hooks](https://prettier.io/docs/precommit)
- [Prettier + ESLint Integration](https://prettier.io/docs/integrating-with-linters)
- [React Router](https://reactrouter.com/)
- [Vitest](https://vitest.dev/)
- [pnpm](https://pnpm.io/)

---

**You're all set! 🚀 Your frontend is now configured with the latest best practices.**
