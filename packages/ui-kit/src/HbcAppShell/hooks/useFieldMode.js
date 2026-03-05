/**
 * useFieldMode — Manages Field Mode (dark theme) toggle
 * PH4.4 §Step 1 | Blueprint §1d
 *
 * Reads/writes localStorage 'hbc-field-mode'.
 * Listens to prefers-color-scheme media query.
 * Sets data-theme="field" on <html> when active.
 */
import { useState, useEffect, useCallback } from 'react';
const STORAGE_KEY = 'hbc-field-mode';
function getInitialFieldMode() {
    if (typeof window === 'undefined')
        return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null)
        return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
export function useFieldMode() {
    const [isFieldMode, setIsFieldMode] = useState(getInitialFieldMode);
    // Sync data-theme attribute on <html> and <meta name="theme-color">
    useEffect(() => {
        if (typeof document === 'undefined')
            return;
        const root = document.documentElement;
        if (isFieldMode) {
            root.setAttribute('data-theme', 'field');
        }
        else {
            root.removeAttribute('data-theme');
        }
        // Update <meta name="theme-color"> for mobile browser chrome
        const themeColor = isFieldMode ? '#0F1419' : '#FFFFFF';
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.content = themeColor;
    }, [isFieldMode]);
    // Listen for OS theme changes (only when no explicit preference stored)
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            if (localStorage.getItem(STORAGE_KEY) === null) {
                setIsFieldMode(e.matches);
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    const toggleFieldMode = useCallback(() => {
        setIsFieldMode((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    }, []);
    return {
        isFieldMode,
        toggleFieldMode,
        theme: isFieldMode ? 'field' : 'light',
    };
}
//# sourceMappingURL=useFieldMode.js.map