/**
 * useSidebarState — Manages sidebar expand/collapse + responsive breakpoint
 * PH4.4 §Step 1 | Blueprint §2c
 *
 * Persists expanded state to localStorage 'hbc-sidebar-state'.
 * Mobile (< 1024px) = sidebar hidden entirely.
 */
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'hbc-sidebar-state';
const MOBILE_BREAKPOINT = 1024;

export interface UseSidebarStateReturn {
  isExpanded: boolean;
  isMobile: boolean;
  toggle: () => void;
}

function getInitialExpanded(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'expanded';
  return window.innerWidth >= MOBILE_BREAKPOINT;
}

function getIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useSidebarState(): UseSidebarStateReturn {
  const [isExpanded, setIsExpanded] = useState(getInitialExpanded);
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggle = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? 'expanded' : 'collapsed');
      return next;
    });
  }, []);

  return { isExpanded, isMobile, toggle };
}
