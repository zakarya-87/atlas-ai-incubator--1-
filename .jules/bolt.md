## 2026-01-16 - Prevent unnecessary re-renders in heavy App components

**Learning:** In a monolithic component like `AppContent` that manages frequently changing state (e.g., textarea input), all non-related children will re-render unless explicitly memoized. If those children also receive inline callbacks, `React.memo` will fail.
**Action:** Always wrap navigation and header components in `React.memo()` and ensure callbacks passed to them are stable using `useCallback()`.

## 2026-01-16 - Stabilize callbacks when memoizing heavy components

**Learning:** When memoizing heavy child components (like `ExportControls` or `BusinessInputForm`) to prevent re-renders, ensure all parent callback props (e.g., `handleToggleFocusMode`) are stabilized using `useCallback()`. Failing to stabilize these callbacks will break the memoization and trigger re-renders anyway.
**Action:** Use `useCallback()` to stabilize callbacks passed to memoized components.
