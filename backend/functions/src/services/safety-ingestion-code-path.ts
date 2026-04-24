export const SAFETY_INGESTION_REQUIRED_CODE_PATH = 'graph-only' as const;

export class SafetyIngestionCodePathViolationError extends Error {
  readonly code = 'SAFETY_INGESTION_CODE_PATH_VIOLATION' as const;
  readonly observedCodePath: string;
  readonly expectedCodePath: typeof SAFETY_INGESTION_REQUIRED_CODE_PATH;
  readonly operation: 'ingest' | 'preview' | 'replay' | 'reporting-period-probe';

  constructor(input: {
    observedCodePath: string;
    operation: 'ingest' | 'preview' | 'replay' | 'reporting-period-probe';
  }) {
    super(
      `Safety ingestion backend requires codePath="${SAFETY_INGESTION_REQUIRED_CODE_PATH}" ` +
      `for ${input.operation}; observed "${input.observedCodePath}".`,
    );
    this.name = 'SafetyIngestionCodePathViolationError';
    this.observedCodePath = input.observedCodePath;
    this.expectedCodePath = SAFETY_INGESTION_REQUIRED_CODE_PATH;
    this.operation = input.operation;
  }
}
