/**
 * HbcDescriptionList — Semantic key/value metadata display
 * Uses <dl>/<dt>/<dd> for accessibility.
 */
import type * as React from 'react';

export interface DescriptionListItem {
  /** Label text */
  label: string;
  /** Value content (string or React node) */
  value: React.ReactNode;
}

export interface HbcDescriptionListProps {
  /** List of label/value pairs to display */
  items: DescriptionListItem[];
  /** Compact spacing for card contexts (default false) */
  dense?: boolean;
  /** Additional CSS class */
  className?: string;
}
