
import { useState, useEffect, useCallback } from 'react';

function usePersistedState<T>(key: string, initialState: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state function to read from localStorage only on first render
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialState;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialState;
    }
  });

  // Sync with localStorage whenever state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistedState;
