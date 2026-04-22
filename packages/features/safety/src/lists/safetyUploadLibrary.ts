import { SAFETY_SITE_URL, type SiteScopedListDescriptor } from './descriptors.js';
import { ZERO_GUID, getOverlayGuid } from './guidConfig.js';

const BASE: SiteScopedListDescriptor = {
  siteUrl: SAFETY_SITE_URL,
  id: ZERO_GUID,
  title: 'Safety Checklist Uploads',
  urlSegment: 'SafetyChecklistUploads',
  purpose: 'Landing library for coordinator-submitted safety checklist workbooks.',
  criticalFieldInternalNames: ['InspectionNumber', 'InspectionDate', 'ProjectNumber'],
};

export const SafetyChecklistUploadsLibrary: SiteScopedListDescriptor = BASE;

export const SAFETY_UPLOAD_LIBRARY_SERVER_RELATIVE_PATH =
  '/sites/Safety/Safety Checklist Uploads' as const;

/**
 * Resolve the upload-library descriptor with any runtime overlay applied.
 * Unlike the HBCentral safety lists, the upload library can be addressed by
 * server-relative folder path (REST `/Files/add`) even without a GUID, so we
 * do **not** fail closed here — we return the zero-GUID descriptor when no
 * overlay is configured and let the upload helper choose the right endpoint.
 */
export function resolveUploadLibraryDescriptor(): SiteScopedListDescriptor {
  const overlayGuid = getOverlayGuid('SafetyChecklistUploads');
  return overlayGuid ? { ...BASE, id: overlayGuid } : BASE;
}
