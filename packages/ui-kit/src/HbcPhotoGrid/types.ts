/** HbcPhotoGrid — PH4.13 §13.4 photo gallery grid */

export interface PhotoItem {
  /** Unique photo identifier */
  id: string;
  /** Full-size image source URL */
  src: string;
  /** Optional thumbnail source URL */
  thumbnailSrc?: string;
  /** Alt text for accessibility */
  alt: string;
  /** Optional caption text */
  caption?: string;
  /** ISO timestamp of when the photo was taken/uploaded */
  createdAt?: string;
}

export interface HbcPhotoGridProps {
  /** Photos to display */
  photos: PhotoItem[];
  /** Number of grid columns (default 3) */
  columns?: 2 | 3 | 4;
  /** Click handler for individual photos */
  onPhotoClick?: (photo: PhotoItem) => void;
  /** Handler for "add photo" tile — shows the + tile when provided */
  onAddPhoto?: () => void;
  /** Maximum photos to display before showing "+N more" tile */
  maxDisplay?: number;
  /** Additional CSS class */
  className?: string;
}
