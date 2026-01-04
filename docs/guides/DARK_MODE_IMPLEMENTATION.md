# Dark Mode Implementation Guide

**Complete guide to implementing light/dark mode theming with Tailwind CSS v4**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problems Encountered](#2-problems-encountered)
3. [Solution Architecture](#3-solution-architecture)
4. [Implementation Steps](#4-implementation-steps)
5. [Component Patterns](#5-component-patterns)
6. [Testing & Debugging](#6-testing--debugging)
7. [Common Pitfalls](#7-common-pitfalls)

---

## 1. Overview

### What We Built

A complete light/dark mode theme system with:
- **Manual toggle** (sun/moon icon)
- **Persistent preferences** (localStorage)
- **Glassmorphic design** (modern, minimal aesthetics)
- **Proper contrast** in both modes

### Tech Stack

- **Tailwind CSS v4.1.18** (with `@custom-variant` for dark mode)
- **React 19.2.3** (Context API for theme management)
- **TypeScript 5.7+** (Type-safe theme implementation)
- **Vite 7.2.7** (Fast HMR during development)

---

## 2. Problems Encountered

### Problem #1: Duplicate CSS Body Declarations

**Symptom:** Text was invisible in light mode, showing white text on white background

**Root Cause:** The `index.css` file had duplicate `body` declarations:

```css
/* First declaration (line 5) */
body {
  background: linear-gradient(...);
  color: #171717 !important;  /* Dark text */
}

/* ... @theme block ... */

/* Second declaration (line 73) - OVERRIDING THE FIRST! */
body {
  background: linear-gradient(...);
  color: #171717;  /* No !important - this wins */
}
```

**Why it failed:** CSS cascade rules mean the last declaration wins. The second `body` block overrode the first, causing inconsistent text colors.

**Fix:** Removed duplicate declarations, kept only one clean `body` definition.

---

### Problem #2: Wrong Tailwind v4 Configuration

**Symptom:** `dark:` utility classes weren't working at all

**Root Cause:** Used Tailwind v3 syntax instead of v4:

```css
/* ❌ WRONG - Tailwind v3 syntax (doesn't work in v4) */
@theme {
  --dark-selector: .dark;
}
```

**Why it failed:** Tailwind CSS v4 completely changed how dark mode is configured. The `--dark-selector` property was removed in favor of the new `@custom-variant` directive.

**Fix:** Use the correct Tailwind v4 syntax:

```css
/* ✅ CORRECT - Tailwind v4 syntax */
@custom-variant dark (&:where(.dark, .dark *));
```

**Reference:** [Tailwind CSS v4 Dark Mode Docs](https://tailwindcss.com/docs/dark-mode)

---

### Problem #3: Missing Dark Mode Variants

**Symptom:** Components looked fine in dark mode but text was invisible in light mode (or vice versa)

**Root Cause:** Components were missing `dark:` variants on text/background colors:

```tsx
// ❌ BEFORE - No dark mode support
<h3 className="text-neutral-900">Title</h3>
<p className="text-neutral-600">Description</p>
```

**Fix:** Added proper `dark:` variants to all components:

```tsx
// ✅ AFTER - Proper dark mode support
<h3 className="text-neutral-900 dark:text-neutral-50">Title</h3>
<p className="text-neutral-700 dark:text-neutral-300">Description</p>
```

---

## 3. Solution Architecture

### File Structure

```
client/src/
├── index.css                          # Theme configuration
├── shared/
│   ├── contexts/
│   │   ├── theme.ts                  # Theme context definition
│   │   └── ThemeContext.tsx          # Theme provider component
│   ├── hooks/
│   │   └── useTheme.ts               # Theme hook
│   └── components/
│       ├── ui/
│       │   └── ThemeToggle.tsx       # Toggle button component
│       └── layout/
│           ├── Header.tsx            # Contains ThemeToggle
│           └── PageLayout.tsx        # Wraps all pages
└── main.tsx                           # ThemeProvider wrapper
```

**Why Split Into Multiple Files?**

ESLint's `react-refresh/only-export-components` rule requires that files only export React components for Fast Refresh to work properly. We split the code into:
- **`theme.ts`** - Context definition (not a component)
- **`ThemeContext.tsx`** - Provider component only
- **`useTheme.ts`** - Custom hook

### Data Flow

```
User clicks ThemeToggle
    ↓
toggleTheme() called
    ↓
Theme state updates ('light' → 'dark')
    ↓
useEffect triggers
    ↓
.dark class added to <html> and <body>
    ↓
Tailwind applies dark: variants
    ↓
localStorage saves preference
    ↓
UI updates instantly
```

---

## 4. Implementation Steps

### Step 1: Configure Tailwind CSS v4 Dark Mode

**File:** `client/src/index.css`

```css
/* TailwindCSS 4 - Single import line */
@import 'tailwindcss';

/* Dark mode configuration - Tailwind v4 syntax */
@custom-variant dark (&:where(.dark, .dark *));

/* Modern Minimal Color System */
@theme {
  /* Primary Brand Colors - Teal/Cyan */
  --color-primary-600: #0d9488;
  --color-primary-700: #0f766e;

  /* Neutral Grays */
  --color-neutral-50: #fafafa;
  --color-neutral-700: #404040;
  --color-neutral-900: #171717;

  /* ...rest of theme colors... */
}

/* LIGHT MODE */
body {
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 50%, #f5f5f5 100%);
  background-attachment: fixed;
  color: #171717; /* Dark text for light mode */
}

/* DARK MODE */
body.dark {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  color: #fafafa; /* Light text for dark mode */
}
```

**Key Points:**
- ✅ `@custom-variant dark` is the v4 way to enable dark mode
- ✅ `.dark` class on body/html triggers dark mode
- ✅ No duplicate body declarations

---

### Step 2: Create Theme Context

**File:** `client/src/shared/contexts/theme.ts`

```tsx
import { createContext } from 'react';

type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
```

---

### Step 3: Create Theme Provider Component

**File:** `client/src/shared/contexts/ThemeContext.tsx`

```tsx
import { useEffect, useState, ReactNode } from 'react';
import { ThemeContext } from './theme';

type Theme = 'light' | 'dark';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then default to light mode
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      return savedTheme;
    }
    return 'light'; // Default to light mode
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

**Key Points:**
- ✅ Manages theme state (light/dark)
- ✅ Persists to localStorage
- ✅ Applies `.dark` class to both html and body
- ✅ Separated from context definition for ESLint compliance

---

### Step 4: Create useTheme Hook

**File:** `client/src/shared/hooks/useTheme.ts`

```tsx
import { useContext } from 'react';
import { ThemeContext } from '../contexts/theme';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

**Key Points:**
- ✅ Provides type-safe access to theme context
- ✅ Throws error if used outside ThemeProvider
- ✅ Separated from provider for ESLint compliance

---

### Step 5: Create Theme Toggle Button

**File:** `client/src/shared/components/ui/ThemeToggle.tsx`

```tsx
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <span className="text-2xl">🌙</span>
      ) : (
        <span className="text-2xl text-yellow-400">☀️</span>
      )}
    </button>
  );
};
```

---

### Step 6: Wrap App with ThemeProvider

**File:** `client/src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

---

## 5. Component Patterns

### Color Strategy

| Element Type | Light Mode | Dark Mode | Tailwind Classes |
|-------------|-----------|-----------|------------------|
| **Headings (H1-H2)** | `neutral-900` | `neutral-50` | `text-neutral-900 dark:text-neutral-50` |
| **Body Text** | `neutral-700` | `neutral-300` | `text-neutral-700 dark:text-neutral-300` |
| **Secondary Text** | `neutral-600` | `neutral-400` | `text-neutral-600 dark:text-neutral-400` |
| **Brand Text** | `primary-700` | `primary-400` | `text-primary-700 dark:text-primary-400` |
| **Cards** | `white/70` | `white/5` | `bg-white/70 dark:bg-white/5` |
| **Badges** | `primary-50` | `primary-900/30` | `bg-primary-50 dark:bg-primary-900/30` |

### Pattern #1: Card with Text

```tsx
<Card padding="lg" className="text-center">
  <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
    Supported Exercises
  </h2>
  <p className="text-neutral-700 dark:text-neutral-300 mb-8">
    Start with push-ups and jump rope.
  </p>
</Card>
```

### Pattern #2: Status Badge

```tsx
<span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
  Easy
</span>
```

### Pattern #3: Button

```tsx
<button className="px-8 py-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-bold rounded-xl transition-all">
  Get Started
</button>
```

---

## 6. Testing & Debugging

### Debug Checklist

1. **Check if `.dark` class is applied:**
```javascript
// Browser console
console.log('HTML classes:', document.documentElement.className);
console.log('Body classes:', document.body.className);
// Expected: "dark" in dark mode, "" in light mode
```

2. **Check computed styles:**
```javascript
// Browser console
const body = document.body;
console.log('Body color:', getComputedStyle(body).color);
// Light mode: rgb(23, 23, 23) - dark text
// Dark mode: rgb(250, 250, 250) - light text
```

3. **Verify Tailwind compilation:**
```bash
cd client
pnpm dev
# Watch terminal for CSS compilation errors
```

4. **Inspect in DevTools:**
- Open DevTools (F12)
- Inspect text elements
- Check "Computed" tab for color values
- Verify `dark:` classes apply when `.dark` exists

### Testing Checklist

- [ ] Light mode: All text clearly visible (dark on light)
- [ ] Dark mode: All text clearly visible (light on dark)
- [ ] Toggle button works (icon switches)
- [ ] Preference persists after refresh
- [ ] Cards have glassmorphic effects in both modes
- [ ] Badges have proper contrast in both modes
- [ ] Buttons styled correctly in both modes
- [ ] Footer clearly separated in both modes

---

## 7. Common Pitfalls

### ❌ DON'T: Use `!important` unnecessarily

```css
/* Bad - causes specificity issues */
body {
  color: #171717 !important;
}
```

### ✅ DO: Use proper CSS cascade

```css
/* Good - let Tailwind handle it */
body {
  color: #171717;
}
body.dark {
  color: #fafafa;
}
```

---

### ❌ DON'T: Forget dark mode variants

```tsx
// Bad - invisible in dark mode
<h1 className="text-neutral-900">Title</h1>
```

### ✅ DO: Always add both variants

```tsx
// Good - visible in both modes
<h1 className="text-neutral-900 dark:text-neutral-50">Title</h1>
```

---

### ❌ DON'T: Use Tailwind v3 syntax

```css
/* Bad - doesn't work in v4 */
@theme {
  --dark-selector: .dark;
}
```

### ✅ DO: Use Tailwind v4 syntax

```css
/* Good - correct v4 syntax */
@custom-variant dark (&:where(.dark, .dark *));
```

---

## Summary

**The Fix in Three Steps:**

1. ✅ Use `@custom-variant dark` (Tailwind v4 syntax)
2. ✅ Remove duplicate CSS body declarations
3. ✅ Add `dark:` variants to all text/background classes

**Result:** Fully functional light/dark mode with:
- ✨ Persistent user preferences
- ✨ Excellent contrast in both modes
- ✨ Modern glassmorphic design
- ✨ Smooth transitions

---

## References

- [Tailwind CSS v4 Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode)
- [Tailwind CSS v4 Theme Configuration](https://tailwindcss.com/docs/theme)
- [Tailwind v4 GitHub Discussion](https://github.com/tailwindlabs/tailwindcss/discussions/16925)
- [React Context API](https://react.dev/reference/react/useContext)
- [ADR-008: TailwindCSS Styling](../adr/008-tailwindcss-styling.md)

---

*Last Updated: January 4, 2026*
*Tailwind CSS: v4.1.18*
*React: v19.2.3*
