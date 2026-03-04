/** HbcCalendarGrid — PH4.13 §13.5 month calendar grid */
import type { ReactNode } from 'react';

export interface CalendarDayData {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Day status for color-coded dot */
  status?: 'draft' | 'submitted' | 'approved';
  /** Optional weather icon ReactNode */
  weatherIcon?: ReactNode;
  /** Crew count to display */
  crewCount?: number;
  /** Additional badge elements */
  badges?: ReactNode[];
}

export interface HbcCalendarGridProps {
  /** Calendar year */
  year: number;
  /** Calendar month (0-indexed: 0=January, 11=December) */
  month: number;
  /** Day data keyed by date */
  days: CalendarDayData[];
  /** Click handler for a day cell */
  onDayClick?: (date: string) => void;
  /** Month navigation handler: +1 for next, -1 for previous */
  onMonthChange?: (direction: number) => void;
  /** Additional CSS class */
  className?: string;
}
