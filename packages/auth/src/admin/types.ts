import type { AccessControlAdminRepository, AccessControlAdminSection } from '../types.js';

/**
 * Public props for the Phase 5.11 minimal admin surface.
 */
export interface AdminAccessControlPageProps {
  repository?: AccessControlAdminRepository;
  initialSection?: AccessControlAdminSection;
  title?: string;
}

/**
 * Section descriptor model used by admin navigation controls.
 */
export interface AdminSectionDescriptor {
  id: AccessControlAdminSection;
  label: string;
  description: string;
}
