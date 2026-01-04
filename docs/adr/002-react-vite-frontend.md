# ADR-002: React + Vite for Frontend Framework

**Status:** Accepted
**Date:** 2026-01-02
**Decision Makers:** Technical Lead, Frontend Team

## Context and Problem Statement

We need a modern frontend framework that enables rapid development, has excellent developer experience, and can scale to a complex application with real-time camera processing.

## Considered Options

1. **React + Vite** - Modern, fast dev experience
2. **Vue.js + Vite** - Simpler learning curve
3. **Angular** - Full framework, more opinionated
4. **Vanilla JavaScript** - Maximum control, more work

## Decision

Use **React 19+ with Vite 7+** as build tool

## Rationale

* **Ecosystem:** Largest component library ecosystem (Material-UI, shadcn/ui, Headless UI)
* **Vite Performance:** 10x faster than Webpack, instant Hot Module Replacement
* **React 19 Features:** Concurrent rendering benefits for real-time video processing
* **Job Market:** Easier to hire React developers
* **MediaPipe Integration:** Excellent examples and community support
* **Component Reusability:** Perfect for modular exercise detection logic
* **TypeScript Support:** First-class TypeScript integration

## Consequences

### Positive

* Sub-second build times with Vite
* Hot Module Replacement improves developer productivity by 50%
* Large ecosystem of UI libraries
* Easy state management with hooks (no Redux needed for MVP)
* Clear upgrade path to React Native for mobile apps

### Negative

* Slightly steeper learning curve than Vue for complete beginners
* Need to choose state management approach (using Zustand for MVP)
* Client-side routing needs React Router

## Mitigation Strategies

* Use Zustand for state (simpler than Redux)
* Comprehensive documentation and code comments
* Leverage TypeScript for better developer experience
* Provide React training resources for team

## Confidence Level

**High** (9/10) - React + Vite is industry standard with massive community support

## Related Decisions

* Related to [ADR-001](001-mediapipe-for-pose-detection.md) - MediaPipe integration
* Related to [ADR-008](008-tailwindcss-styling.md) - UI styling approach
