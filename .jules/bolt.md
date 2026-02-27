## 2026-01-16 - Prevent unnecessary re-renders in heavy App components

**Learning:** In a monolithic component like `AppContent` that manages frequently changing state (e.g., textarea input), all non-related children will re-render unless explicitly memoized. If those children also receive inline callbacks, `React.memo` will fail.
**Action:** Always wrap navigation and header components in `React.memo()` and ensure callbacks passed to them are stable using `useCallback()`.
