## 2026-01-16 - Prevent unnecessary re-renders in heavy App components

**Learning:** In a monolithic component like `AppContent` that manages frequently changing state (e.g., textarea input), all non-related children will re-render unless explicitly memoized. If those children also receive inline callbacks, `React.memo` will fail.
**Action:** Always wrap navigation and header components in `React.memo()` and ensure callbacks passed to them are stable using `useCallback()`.

## $(date +%Y-%m-%d) - Context Value Memoization
**Learning:** React Context Providers in this codebase (`AuthContext`, `LanguageContext`, `ToastContext`) were passing newly created inline object literals to their `value` props on every render. This forces unnecessary re-renders of all consuming components when the provider's parent re-renders, even if the actual context data hasn't changed.
**Action:** Always wrap the `value` prop objects passed to Context Providers in a `useMemo` hook, with properly specified dependency arrays, to ensure reference stability and prevent these cascading re-renders.
