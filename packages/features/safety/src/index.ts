/**
 * @hbc/features-safety — Safety Record Keeping domain package.
 *
 * Release 1 scope:
 * - Governed `.xlsx` checklist upload + validation + parse + score.
 * - Cross-site writes: UX on /sites/Safety, authoritative records on /sites/HBCentral.
 * - Real SharePoint REST adapter.
 *
 * See docs/architecture/plans/MASTER/spfx/safety-records/design-pacakge/.
 */

// -- Domain --------------------------------------------------------------
export * from './domain/types.js';
export {
  ANCHOR_CELLS,
  ALL_DISPLAYED_ROWS,
  HIGH_SEVERITY_WEIGHT_FLOOR,
  METADATA_ENTRY_CELLS,
  PARSER_VERSION,
  REQUIRED_SHEETS,
  RESPONSE_HEADERS,
  RESPONSE_MARK_LITERAL,
  SECTIONS,
  SHEET_SCORECARD,
  SHEET_SCORING_WEIGHTS,
  SUMMARY_VALUE_CELLS,
  TEMPLATE_VERSION,
  findSectionForRow,
} from './domain/templateContract.js';
export type { SectionDefinition } from './domain/templateContract.js';

// -- Parser --------------------------------------------------------------
export { validateTemplate } from './parser/validateTemplate.js';
export type { ValidateTemplateResult } from './parser/validateTemplate.js';
export { extractMetadata } from './parser/extractMetadata.js';
export { parseChecklist } from './parser/parseChecklist.js';
export {
  createSyntheticWorkbookView,
  type WorkbookView,
} from './parser/workbookView.js';
export {
  computeChecksum,
  readWorkbookFromArrayBuffer,
  readWorkbookFromFile,
  wrapWorkbook,
} from './parser/xlsxWorkbookView.js';

// -- Scoring -------------------------------------------------------------
export { computeInspectionScore } from './scoring/scoringEngine.js';
export { extractFindings } from './scoring/findingExtraction.js';
export type { ExtractedFinding } from './scoring/findingExtraction.js';
export { computeProjectWeekRollup } from './scoring/projectWeekRollup.js';
export type { ProjectWeekRollup } from './scoring/projectWeekRollup.js';
export { computeBusinessKey, computeDuplicateKey } from './scoring/duplicateKey.js';
export type { DuplicateKeyInput } from './scoring/duplicateKey.js';

// -- Lists ---------------------------------------------------------------
export {
  HBCENTRAL_SITE_URL,
  LegacyProjectFallbackRegistryList,
  ProjectsReferenceList,
  SAFETY_SITE_URL,
  SafetyFindingsList,
  SafetyIngestionRunsList,
  SafetyInspectionEventsList,
  SafetyProjectWeekRecordsList,
  SafetyReportingPeriodsList,
  getListDescriptor,
  isZeroGuid,
  resolveDescriptor,
} from './lists/descriptors.js';
export type { SafetyListName, SiteScopedListDescriptor } from './lists/descriptors.js';
export {
  SafetyChecklistUploadsLibrary,
  SAFETY_UPLOAD_LIBRARY_SERVER_RELATIVE_PATH,
  resolveUploadLibraryDescriptor,
} from './lists/safetyUploadLibrary.js';
export {
  configureSafetyListGuids,
  currentSafetyGuidOverlay,
  getOverlayGuid,
  resetSafetyListGuidOverlay,
} from './lists/guidConfig.js';
export type { SafetyGuidOverlay, SafetyOverlayKey } from './lists/guidConfig.js';
export {
  FIELD_SCHEMA_BY_LIST,
  SAFETY_FINDINGS_FIELDS,
  SAFETY_INGESTION_RUNS_FIELDS,
  SAFETY_INSPECTION_EVENTS_FIELDS,
  SAFETY_PROJECT_WEEK_RECORDS_FIELDS,
  SAFETY_REPORTING_PERIODS_FIELDS,
} from './lists/fieldSchema.js';
export type { SpFieldDefinition, SpFieldType } from './lists/fieldSchema.js';

// -- Ports + Adapters ----------------------------------------------------
export type {
  ISafetyInspectionRepository,
  InspectionFilter,
  ProjectWeekFilter,
  IngestionRunFilter,
  ReviewQueueEntry,
} from './ports/ISafetyInspectionRepository.js';
export { REVIEW_QUEUE_TERMINAL_STATUSES } from './ports/ISafetyInspectionRepository.js';
export { MockSafetyInspectionRepository } from './adapters/mock/MockSafetyInspectionRepository.js';
export { SharePointSafetyInspectionRepository } from './adapters/sharepoint/SharePointSafetyInspectionRepository.js';
export type { SharePointAdapterOptions } from './adapters/sharepoint/SharePointSafetyInspectionRepository.js';
export {
  SafetyAdapterFetchError,
  SafetyBackendCommandError,
  SafetyConfigurationError,
  isSafetyAdapterFetchError,
  isSafetyBackendCommandError,
  isSafetyConfigurationError,
} from './adapters/sharepoint/errors.js';
export type { SpHttpClient } from './adapters/sharepoint/spHttp.js';
export {
  SafetyUploadError,
  uploadToSafetyChecklistUploads,
  type UploadFailureKind,
} from './adapters/sharepoint/uploadToSafetyChecklistUploads.js';
export {
  downloadUploadedWorkbook,
  type DownloadedWorkbook,
} from './adapters/sharepoint/downloadUploadedWorkbook.js';
export type {
  SafetyBackendCommandOptions,
  SafetyBackendCommandResult,
  SafetyBackendDiagnostic,
  SafetyBackendErrorEnvelope,
  SafetyBackendFailureEnvelope,
  SafetyBackendIngestionRequest,
  SafetyBackendOperationResult,
  SafetyBackendPreviewOperationResult,
  SafetyBackendReplayRequest,
  SafetyBackendSuccessEnvelope,
} from './adapters/sharepoint/backendContracts.js';

// -- Frontend telemetry --------------------------------------------------
export {
  emitSafetyFrontendEvent,
  resetSafetyFrontendTelemetrySink,
  setSafetyFrontendTelemetrySink,
} from './telemetry/safetyFrontendTelemetry.js';
export type {
  EmitSafetyFrontendEventInput,
  SafetyFrontendLifecycle,
  SafetyFrontendOperation,
  SafetyFrontendTelemetryEvent,
  SafetyFrontendTelemetrySink,
} from './telemetry/safetyFrontendTelemetry.js';

// -- Ingestion -----------------------------------------------------------
export { runIngestionPipeline } from './ingestion/runIngestionPipeline.js';
export type {
  IngestionAdapter,
  IngestionPipelineInput,
} from './ingestion/runIngestionPipeline.js';

// -- Factory + Hooks -----------------------------------------------------
export {
  createSafetyInspectionRepository,
  type CreateRepositoryOptions,
  type SafetyAdapterMode,
} from './factory.js';
export {
  SafetyRepositoryProvider,
  useSafetyRepository,
} from './hooks/repositoryContext.js';
export {
  safetyQueryKeys,
  useFindings,
  useIngestionRuns,
  useInspection,
  useInspections,
  useProjectWeek,
  useProjectWeeks,
  useReplayIngestion,
  useReportingPeriods,
  useReviewQueue,
  useSafetyIngestion,
  useSafetyIngestionPreview,
} from './hooks/queries.js';
export type {
  IngestionMutationInput,
  PreviewIngestionInput,
  ReplayIngestionInput,
} from './hooks/queries.js';

// -- Auth / Capabilities -------------------------------------------------
export {
  PENDING_SAFETY_CAPABILITIES,
  SAFETY_ACTION_ROLES,
  SAFETY_ADMIN_ROLE,
  SAFETY_GLOBAL_OVERRIDE_ROLES,
  SAFETY_OPERATOR_ROLE,
  SAFETY_REVIEWER_ROLE,
  SAFETY_SUBMITTER_ROLE,
  SCOPE_MISSING_SAFETY_CAPABILITIES,
  TOKEN_UNAVAILABLE_SAFETY_CAPABILITIES,
  UNAUTHORIZED_SAFETY_CAPABILITIES,
  resolveSafetyCapabilities,
  safetyCapabilitiesFromTokenRoles,
  safetyCapabilityReason,
} from './auth/safetyCapabilities.js';
export type {
  SafetyAction,
  SafetyCapabilities,
  SafetyCapabilityState,
} from './auth/safetyCapabilities.js';
export { useSafetyCapabilities } from './auth/useSafetyCapabilities.js';
export {
  SafetyCapabilityProvider,
  useSafetyCapabilityContext,
} from './auth/SafetyCapabilityProvider.js';
export type { SafetyCapabilityProviderProps } from './auth/SafetyCapabilityProvider.js';
export {
  acquireSpfxApiTokenAuthority,
} from './auth/spfxApiTokenAuthority.js';
export type {
  AadTokenProviderHost,
  ApiTokenAuthority,
  ApiTokenErrorClass,
  DecodedApiTokenClaims,
} from './auth/spfxApiTokenAuthority.js';
export {
  buildSafetyCapabilityProof,
  publishSafetyCapabilityProof,
  SAFETY_CAPABILITY_PROOF_GLOBAL_KEY,
} from './auth/safetyCapabilityProof.js';
export type {
  PublishSafetyCapabilityProofInput,
  SafetyCapabilityProof,
  SafetyCapabilityProofDecoded,
  SafetyCapabilitySourcePath,
  SafetyCapabilityTokenStatus,
} from './auth/safetyCapabilityProof.js';
