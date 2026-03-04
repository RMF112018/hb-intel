/**
 * HbcPagination — Type definitions
 * PH4.10 §Step 4 | Blueprint §2c
 */

export type PageSizeOption = 25 | 50 | 100;

export interface HbcPaginationProps {
  /** Total number of items across all pages */
  totalItems: number;
  /** Current page number (1-based) */
  currentPage: number;
  /** Items per page */
  pageSize: PageSizeOption;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: PageSizeOption) => void;
  /** Maximum number of page buttons to show (default 7) */
  maxPageButtons?: number;
  /** When true, uses HBC_SURFACE_FIELD dark tokens */
  isFieldMode?: boolean;
  /** Additional CSS class */
  className?: string;
}
