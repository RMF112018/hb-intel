/**
 * Data quality scoring for Safety Field Excellence.
 *
 * Penalizes ingestion conditions that would make a candidate unreliable
 * for homepage recognition. Returns the score plus a notes array used by
 * narrative and eligibility paths.
 */

import type { SafetyInspectionEvent } from '../domain/types.js';
import type { InspectionPartition } from './inspectionFiltering.js';

export interface DataQualityResult {
  readonly score: number;
  readonly notes: ReadonlyArray<string>;
  readonly hasReviewRequired: boolean;
  readonly hasDuplicateSuspected: boolean;
}

const DUPLICATE_PENALTY = 20;
const REVIEW_REQUIRED_PENALTY = 20;
const MISSING_PARSER_PENALTY = 10;
const MISSING_UPLOAD_PENALTY = 10;

export function computeDataQualityScore(
  windowEvents: ReadonlyArray<SafetyInspectionEvent>,
  partition: InspectionPartition,
): DataQualityResult {
  const notes: string[] = [];
  let score = 100;

  if (partition.duplicateSuspected.length > 0) {
    score -= DUPLICATE_PENALTY;
    notes.push(`duplicate-suspected inspections present (${partition.duplicateSuspected.length})`);
  }

  if (partition.reviewRequired.length > 0) {
    score -= REVIEW_REQUIRED_PENALTY;
    notes.push(`review-required inspections present (${partition.reviewRequired.length})`);
  }

  const missingParser = windowEvents.filter(
    (event) => !event.parserVersion || !event.templateVersion,
  );
  if (missingParser.length > 0) {
    score -= MISSING_PARSER_PENALTY;
    notes.push(`inspections missing parser/template metadata (${missingParser.length})`);
  }

  const missingUpload = partition.accepted.filter((event) => !event.sourceUploadItemId);
  if (missingUpload.length > 0) {
    score -= MISSING_UPLOAD_PENALTY;
    notes.push(`accepted inspections missing source upload reference (${missingUpload.length})`);
  }

  if (score < 0) score = 0;

  return {
    score,
    notes,
    hasReviewRequired: partition.reviewRequired.length > 0,
    hasDuplicateSuspected: partition.duplicateSuspected.length > 0,
  };
}
