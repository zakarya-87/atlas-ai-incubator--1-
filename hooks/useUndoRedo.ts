import { useState, useCallback, useEffect } from 'react';

export interface UndoRedoState<T> {
  state: T;
  set: (newState: T | ((prevState: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (newState: T) => void;
  history: T[];
}

export default function useUndoRedo<T>(initialState: T): UndoRedoState<T> {
  const [state, setState] = useState<T>(initialState);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  const set = useCallback((newState: T | ((prevState: T) => T)) => {
    setState((currentState) => {
      const calculatedState = typeof newState === 'function' ? (newState as any)(currentState) : newState;
      
      // Deep comparison could be added here for performance, but strict reference check is usually enough for React
      if (calculatedState === currentState) return currentState;
      
      setPast((prev) => [...prev, currentState]);
      setFuture([]); // Clear future when new action is taken
      return calculatedState;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const newPast = prevPast.slice(0, -1);
      const previousState = prevPast[prevPast.length - 1];
      
      setFuture((prevFuture) => [state, ...prevFuture]);
      setState(previousState);
      
      return newPast;
    });
  }, [state]);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const newFuture = prevFuture.slice(1);
      const nextState = prevFuture[0];
      
      setPast((prevPast) => [...prevPast, state]);
      setState(nextState);
      
      return newFuture;
    });
  }, [state]);

  const reset = useCallback((newState: T) => {
    setPast([]);
    setFuture([]);
    setState(newState);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        if (event.key === 'z') {
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          // event.preventDefault(); // Optional: might conflict with browser undo in inputs
        } else if (event.key === 'y') {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    reset,
    history: past
  };
}