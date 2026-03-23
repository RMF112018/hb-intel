/**
 * SF25-T04 — Readiness evaluation hook.
 */
import { useMemo } from 'react';
import type { IPublishRequest, IReadinessState, IReadinessRule, IPublicationRecord } from '../types/index.js';
import { evaluateReadiness } from '../model/lifecycle.js';

export interface UsePublishReadinessStateOptions { request: IPublishRequest; rules: IReadinessRule[]; }

export interface UsePublishReadinessStateResult {
  readiness: IReadinessState;
  isReady: boolean;
  blockingCount: number;
}

export function usePublishReadinessState(options: UsePublishReadinessStateOptions): UsePublishReadinessStateResult {
  const { request, rules } = options;
  const readiness = useMemo(() => evaluateReadiness(request, rules), [request, rules]);
  return { readiness, isReady: readiness.isReady, blockingCount: readiness.blockingReasons.length };
}
