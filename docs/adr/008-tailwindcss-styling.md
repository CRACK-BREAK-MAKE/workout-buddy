# ADR-008: TailwindCSS for Styling

**Status:** Accepted

**Date:** 2026-01-02

**Decision Makers:** Technical Lead, UI/UX Designer

## Context and Problem Statement

We need a CSS strategy that enables rapid UI development, maintains visual consistency, and produces small production bundles. The solution should work well with React components and support responsive design and dark mode.

## Decision Drivers

* Must enable rapid UI development (MVP timeline: 4 weeks)
* Must maintain visual consistency (spacing, colors, typography)
* Must produce small production CSS bundles
* Must support responsive design (mobile-first)
* Must support dark mode (important for exercise app used in various lighting)
* Should minimize CSS naming conflicts
* Should have excellent documentation and community

## Considered Options

1. **TailwindCSS** - Utility-first CSS framework
2. **CSS Modules** - Component-scoped CSS with class names
3. **Styled Components** - CSS-in-JS solution
4. **Plain CSS/SCSS** - Traditional cascading stylesheets

## Decision

Use **TailwindCSS 4.1+** with custom configuration for brand colors

## Rationale

* **Rapid Development:** Build UI 40-50% faster than writing custom CSS
* **Built-in Design System:** Consistent spacing scale, colors, typography out of the box
* **Tiny Production Bundle:** PurgeCSS removes unused styles automatically (<10KB typical)
* **Responsive by Default:** Mobile-first utilities with simple breakpoint syntax
* **Dark Mode Support:** First-class dark mode with `dark:` prefix
* **No Naming Required:** Eliminates CSS naming bikeshedding (DRY principle)
* **Component-Friendly:** Works perfectly with React component model
* **JIT Compiler:** On-demand CSS generation in development (instant feedback)

## Consequences

### Positive

* Very small production CSS bundles (<10KB gzipped)
* Consistent spacing and colors across entire application
* Easy to maintain responsive designs (mobile/tablet/desktop)
* Zero CSS specificity conflicts or naming collisions
* Excellent documentation and large community
* Fast iteration (see changes immediately without switching files)
* Dark mode implementation is trivial

### Negative

* HTML can look cluttered with many utility classes
* Learning curve for developers used to traditional CSS
* Harder to override third-party component styles
* Long class strings can be verbose

### Neutral

* Different mental model than traditional CSS (utility-first)
* Requires Tailwind VSCode extension for best experience

## Implementation Guidelines

**Extracting Components:**
```tsx
// ❌ Bad: Repeated utility classes
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click me
</button>

// ✅ Good: Extract to React component
export function Button({ children }) {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      {children}
    </button>
  );
}
```

**Using @apply for Complex Patterns:**
```css
/* For truly repeated patterns across many components */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
           focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
```

**Custom Configuration:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#your-color',
          secondary: '#your-color',
        }
      }
    }
  }
}
```

## Mitigation Strategies

**Cluttered HTML:**
* Extract common patterns into React components
* Use @apply directive sparingly for truly repeated patterns
* Keep utility class count reasonable (<10 per element)

**Learning curve:**
* Provide Tailwind cheat sheet for team
* Install Tailwind CSS IntelliSense VSCode extension
* Code reviews to share best practices
* Link to Tailwind documentation in README

**Third-party styles:**
* Use Tailwind's `@layer` to organize custom CSS
* Document approach for styling third-party components
* Consider headless UI libraries (Radix, Headless UI) that work with Tailwind

## Validation

**Success Criteria:**

* Production CSS bundle <15KB gzipped
* UI development velocity 40%+ faster than traditional CSS
* Zero CSS specificity/naming conflicts
* Dark mode implemented across all components
* 100% responsive design (mobile/tablet/desktop)

## Confidence Level

**High** (8/10)

Tailwind is widely adopted and proven at scale. The utility-first approach may feel unfamiliar initially but dramatically speeds up development once learned.

## Related Decisions

* Related to [ADR-002](002-react-vite-frontend.md) - React component model
* Complements component-based architecture

## References

* [Tailwind CSS Documentation](https://tailwindcss.com/docs)
* [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
* [Tailwind UI Components](https://tailwindui.com/)
* Implementation: [client/tailwind.config.js](../../client/tailwind.config.js)
