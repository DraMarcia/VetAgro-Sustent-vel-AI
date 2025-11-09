import { useState } from 'react';

/**
 * A robust custom hook to manage state in localStorage.
 * This definitive implementation initializes state by synchronously reading from
 * localStorage inside the useState initializer. This is the most reliable pattern for
 * client-side rendered apps, preventing race conditions and hydration errors
 * that caused images to disappear on page reloads.
 * @param key The key to use in localStorage.
 * @returns A tuple containing:
 *  - The stateful value.
 *  - A function to update it.
 */
export function useLocalStorage(key: string): [string | null, (value: string | null) => void] {
    const [storedValue, setStoredValue] = useState<string | null>(() => {
        // This initializer function runs only once on component mount.
        try {
            // Ensure this code runs only in the browser.
            if (typeof window !== 'undefined') {
                const item = window.localStorage.getItem(key);
                // Return the stored item, or null if it doesn't exist.
                return item;
            }
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
        }
        // Return null if not in a browser environment or if an error occurred.
        return null;
    });

    const setValue = (value: string | null) => {
        try {
            // Update the state
            setStoredValue(value);
            
            // Persist to localStorage
            if (typeof window !== 'undefined') {
                if (value === null || value === '') {
                    // If the new value is null or an empty string, remove the key from storage.
                    window.localStorage.removeItem(key);
                } else {
                    // Otherwise, save the new value to storage.
                    window.localStorage.setItem(key, value);
                }
            }
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    };

    return [storedValue, setValue];
}