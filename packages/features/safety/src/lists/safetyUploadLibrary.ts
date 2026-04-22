import { SAFETY_SITE_URL, type SiteScopedListDescriptor } from './descriptors.js';

const ZERO_GUID = '00000000-0000-0000-0000-000000000000';

export const SafetyChecklistUploadsLibrary: SiteScopedListDescriptor = {
  siteUrl: SAFETY_SITE_URL,
  id: ZERO_GUID,
  title: 'Safety Checklist Uploads',
  urlSegment: 'SafetyChecklistUploads',
  purpose: 'Landing library for coordinator-submitted safety checklist workbooks.',
  criticalFieldInternalNames: ['InspectionNumber', 'InspectionDate', 'ProjectNumber'],
};

export const SAFETY_UPLOAD_LIBRARY_SERVER_RELATIVE_PATH = '/sites/Safety/SafetyChecklistUploads' as const;
