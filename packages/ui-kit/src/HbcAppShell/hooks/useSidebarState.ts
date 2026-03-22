/**
 * useSidebarState — Manages sidebar expand/collapse + responsive breakpoint
 * PH4.4 §Step 1 | Blueprint §2c
 * Traceability: D-PH4C-24, D-PH4C-25
 *
 * Persists expanded state to localStorage 'hbc-sidebar-state'.
 * Mobile (< HBC_BREAKPOINT_SIDEBAR) = sidebar hidden entirely.
 */
import { useState, useEffect, useCallback } from 'react';
import { HBC_BREAKPOINT_SIDEBAR } from '../../theme/breakpoints.js';

const STORAGE_KEY = 'hbc-sidebar-state';

export interface UseSidebarStateReturn {
  isExpanded: boolean;
  isMobile: boolean;
  toggle: () => void;
}

function getInitialExpanded(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'expanded';
  return false;
}

function getIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  // PH4C.12: strict < keeps 1024px in desktop/sidebar territory and <=1023px in tablet/mobile.
  return window.innerWidth < HBC_BREAKPOINT_SIDEBAR;
}

export function useSidebarState(): UseSidebarStateReturn {
  const [isExpanded, setIsExpanded] = useState(getInitialExpanded);
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < HBC_BREAKPOINT_SIDEBAR);
    };

    window.addEventListener('resize', handleResize);
    // UIF-037-addl: Re-evaluate sidebar on device rotation (tablet portrait↔landscape).
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
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
