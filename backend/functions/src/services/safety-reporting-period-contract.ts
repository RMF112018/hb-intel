export interface IReportingPeriodContractInput {
  readonly reportingPeriodId: string;
  readonly reportingPeriodSpItemId?: number;
}

export interface INormalizedReportingPeriodContract {
  readonly reportingPeriodId: string;
  readonly reportingPeriodSpItemId: number;
}

export class ReportingPeriodContractError extends Error {
  readonly code:
    | 'SAFETY_REPORTING_PERIOD_ID_REQUIRED'
    | 'SAFETY_REPORTING_PERIOD_ID_INVALID'
    | 'SAFETY_REPORTING_PERIOD_SP_ITEM_ID_INVALID'
    | 'SAFETY_REPORTING_PERIOD_ID_MISMATCH';
  readonly details: Record<string, unknown>;

  constructor(
    code: ReportingPeriodContractError['code'],
    message: string,
    details: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ReportingPeriodContractError';
    this.code = code;
    this.details = details;
  }
}

const PERIOD_PATTERN = /^period-(\d+)$/;

export function normalizeReportingPeriodContract(
  input: IReportingPeriodContractInput,
): INormalizedReportingPeriodContract {
  const requestedId = String(input.reportingPeriodId ?? '').trim();
  if (!requestedId) {
    throw new ReportingPeriodContractError(
      'SAFETY_REPORTING_PERIOD_ID_REQUIRED',
      'context.reportingPeriodId is required.',
      {
        contract: 'reportingPeriodId=period-{positiveInteger}',
      },
    );
  }

  const match = requestedId.match(PERIOD_PATTERN);
  if (!match) {
    throw new ReportingPeriodContractError(
      'SAFETY_REPORTING_PERIOD_ID_INVALID',
      'context.reportingPeriodId must use canonical format period-{spItemId}.',
      {
        requestedId,
        contract: 'period-{positiveInteger}',
      },
    );
  }

  const parsedFromId = Number(match[1]);
  if (!Number.isInteger(parsedFromId) || parsedFromId <= 0) {
    throw new ReportingPeriodContractError(
      'SAFETY_REPORTING_PERIOD_ID_INVALID',
      'context.reportingPeriodId must contain a positive integer item ID.',
      {
        requestedId,
        parsedFromId,
      },
    );
  }

  if (input.reportingPeriodSpItemId !== undefined) {
    if (!Number.isInteger(input.reportingPeriodSpItemId) || input.reportingPeriodSpItemId <= 0) {
      throw new ReportingPeriodContractError(
        'SAFETY_REPORTING_PERIOD_SP_ITEM_ID_INVALID',
        'context.reportingPeriodSpItemId must be a positive integer when provided.',
        {
          requestedId,
          reportingPeriodSpItemId: input.reportingPeriodSpItemId,
        },
      );
    }

    if (input.reportingPeriodSpItemId !== parsedFromId) {
      throw new ReportingPeriodContractError(
        'SAFETY_REPORTING_PERIOD_ID_MISMATCH',
        'context.reportingPeriodId and context.reportingPeriodSpItemId must reference the same item.',
        {
          requestedId,
          parsedFromId,
          reportingPeriodSpItemId: input.reportingPeriodSpItemId,
        },
      );
    }
  }

  return {
    reportingPeriodId: `period-${parsedFromId}`,
    reportingPeriodSpItemId: parsedFromId,
  };
}
