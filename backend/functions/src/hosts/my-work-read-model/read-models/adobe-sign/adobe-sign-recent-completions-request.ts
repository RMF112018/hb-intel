import type { AdobeSignRecentCompletionsSearchRequest } from './adobe-sign-search-request.js';
import { clampAdobeSignSearchPageSize } from './adobe-sign-search-request.js';

export const ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS = 30 as const;

const RECENT_COMPLETIONS_WINDOW_MS =
  ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export interface AdobeSignRecentCompletionsRequestInput {
  readonly pageSize?: number;
  readonly cursor?: string;
  readonly now: Date;
}

export function buildAdobeSignRecentCompletionsRequest(
  input: AdobeSignRecentCompletionsRequestInput,
): AdobeSignRecentCompletionsSearchRequest {
  if (Number.isNaN(input.now.getTime())) {
    throw new Error('Invalid now timestamp for recent completions request');
  }
  const modifiedWindowEndAtUtc = input.now.toISOString();
  const modifiedWindowStartAtUtc = new Date(
    input.now.getTime() - RECENT_COMPLETIONS_WINDOW_MS,
  ).toISOString();

  return {
    intent: 'recent-completions',
    pageSize: clampAdobeSignSearchPageSize(input.pageSize),
    ...(input.cursor !== undefined ? { cursor: input.cursor } : {}),
    windowDays: ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS,
    modifiedWindowStartAtUtc,
    modifiedWindowEndAtUtc,
  };
}
