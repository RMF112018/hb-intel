import type { RecalibrationAssessment } from '../../types/index.js';

export interface RecalibrationInput {
  predictiveValue: number;
  reviewedAtIso: string;
  telemetryWindow: string;
}

export const createRecalibrationAssessment = (
  input: RecalibrationInput
): RecalibrationAssessment => ({
  predictiveValue: input.predictiveValue,
  reviewedAtIso: input.reviewedAtIso,
  telemetryWindow: input.telemetryWindow,
});
