import type { ReactNode } from 'react';
import { useNavStore } from '../stores/navStore.js';

export interface ContextualSidebarProps {
  /** Override slot for custom sidebar content. */
  sidebarSlot?: ReactNode;
  /** Called when a sidebar item is clicked. */
  onNavigate?: (id: string) => void;
}

/**
 * Tool-specific sidebar navigation — Blueprint §2c.
 * Renders navStore.sidebarItems or an injected sidebarSlot.
 */
export function ContextualSidebar({ sidebarSlot, onNavigate }: ContextualSidebarProps): ReactNode {
  const sidebarItems = useNavStore((s) => s.sidebarItems);
  const isSidebarOpen = useNavStore((s) => s.isSidebarOpen);

  if (!isSidebarOpen) return null;

  return (
    <aside data-hbc-shell="contextual-sidebar">
      {sidebarSlot ?? (
        <nav data-hbc-shell="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              data-hbc-shell="sidebar-item"
              data-active={item.isActive || undefined}
              onClick={() => {
                item.onClick();
                onNavigate?.(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </aside>
  );
}
