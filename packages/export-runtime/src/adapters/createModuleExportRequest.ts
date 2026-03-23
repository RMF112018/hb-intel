/**
 * SF24-T07 — Module export request creation helper.
 *
 * Composes ExportModuleRegistry lookup with createExportRequest from
 * the model layer. Module adapters call this instead of manually
 * building IExportRequestInput.
 *
 * Governing: SF24-T07, L-01 (primitive ownership)
 */

import type {
  ExportFormat,
  ExportIntent,
  IExportRequest,
  IExportVersionRef,
} from '../types/index.js';
import { ExportModuleRegistry } from './ExportModuleRegistry.js';
import { createExportRequest } from '../model/lifecycle.js';

/**
 * Create an export request by looking up the module adapter and
 * delegating to the model layer.
 *
 * @param moduleKey - Registered module key.
 * @param recordId - Record to export.
 * @param projectId - Project context.
 * @param format - Requested output format.
 * @param intent - Export intent classification.
 * @param options - Optional version ref and saved view context.
 * @param now - Optional injectable timestamp for testing.
 * @returns Fully initialized IExportRequest.
 * @throws If module is not registered or format is not supported.
 */
export function createModuleExportRequest(
  moduleKey: string,
  recordId: string,
  projectId: string,
  format: ExportFormat,
  intent: ExportIntent,
  options?: {
    savedViewContext?: Record<string, unknown> | null;
    versionRef?: IExportVersionRef | null;
  },
  now?: Date,
): IExportRequest {
  const registration = ExportModuleRegistry.getByModule(moduleKey);
  if (!registration) {
    throw new Error(`ExportModuleRegistry: module "${moduleKey}" is not registered.`);
  }

  if (!registration.supportedFormats.includes(format)) {
    throw new Error(
      `Module "${moduleKey}" does not support format "${format}". ` +
      `Supported: [${registration.supportedFormats.join(', ')}]`,
    );
  }

  if (!registration.supportedIntents.includes(intent)) {
    throw new Error(
      `Module "${moduleKey}" does not support intent "${intent}". ` +
      `Supported: [${registration.supportedIntents.join(', ')}]`,
    );
  }

  const context = registration.truthProvider.getSourceTruthStamp(recordId, projectId);
  const payload = registration.truthProvider.buildPayload(recordId, projectId, intent);

  return createExportRequest(
    {
      format,
      intent,
      renderMode: 'local',
      complexityTier: registration.complexityTier,
      context,
      payload,
      savedViewContext: options?.savedViewContext ?? null,
      versionRef: options?.versionRef ?? null,
    },
    now,
  );
}
