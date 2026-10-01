import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorage(key, initialValue) {
  const initialRef = useRef(initialValue);

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  /* Re-read from localStorage when the key changes (month switch) */
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(item ? JSON.parse(item) : initialRef.current);
    } catch {
      setStoredValue(initialRef.current);
    }
  }, [key]);

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch (err) {
          console.error('useLocalStorage write failed:', err);
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
