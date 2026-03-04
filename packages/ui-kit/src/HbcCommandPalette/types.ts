/**
 * HbcCommandPalette — PH4.6 §Step 11
 * Command palette types + result categories
 */

export type CommandPaletteCategory = 'navigation' | 'recent' | 'actions' | 'ai';

export interface CommandPaletteResult {
  /** Unique result identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional description text */
  description?: string;
  /** Result category */
  category: CommandPaletteCategory;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Action to perform on selection */
  onSelect: () => void;
}

export interface HbcCommandPaletteProps {
  /** Navigation items (always available offline) */
  navigationItems?: CommandPaletteResult[];
  /** Common action items */
  actionItems?: CommandPaletteResult[];
  /** AI query handler — when online, processes queries via API */
  onAiQuery?: (query: string) => Promise<string>;
  /** Custom result handler */
  onSelect?: (result: CommandPaletteResult) => void;
  /** Additional CSS class */
  className?: string;
}

export interface UseCommandPaletteReturn {
  /** Palette is currently open */
  isOpen: boolean;
  /** Open the palette */
  open: () => void;
  /** Close the palette */
  close: () => void;
  /** Toggle open/close */
  toggle: () => void;
}
