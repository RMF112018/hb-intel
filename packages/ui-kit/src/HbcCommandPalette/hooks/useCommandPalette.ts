/**
 * useCommandPalette — Keyboard shortcut + state management
 * PH4.6 §Step 11
 * Cmd+K (Mac) / Ctrl+K (Windows) activation
 */
import { useState, useCallback } from 'react';
import { useKeyboardShortcut } from '../../HbcAppShell/hooks/useKeyboardShortcut.js';
import type { UseCommandPaletteReturn } from '../types.js';

export function useCommandPalette(): UseCommandPaletteReturn {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Register Cmd+K / Ctrl+K
  useKeyboardShortcut('k', toggle);

  return { isOpen, open, close, toggle };
}
