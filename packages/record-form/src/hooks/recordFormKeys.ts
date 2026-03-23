/**
 * SF23-T04 — Record form query key factory.
 *
 * Governing: SF23-T04
 */

export const recordFormKeys = {
  all: ['record-form'] as const,
  form: (moduleId: string, recordType: string, formId: string) =>
    ['record-form', moduleId, recordType, formId] as const,
  draft: (moduleId: string, recordType: string, formId: string) =>
    ['record-form', moduleId, recordType, formId, 'draft'] as const,
  queue: (moduleId: string, recordType: string, formId: string) =>
    ['record-form', moduleId, recordType, formId, 'queue'] as const,
  recovery: (moduleId: string, recordType: string, formId: string) =>
    ['record-form', moduleId, recordType, formId, 'recovery'] as const,
} as const;
