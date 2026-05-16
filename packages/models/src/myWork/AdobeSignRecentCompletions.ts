/**
 * My Work — Adobe Sign Recent Completions contracts.
 *
 * Type-only DTO vocabulary for the focused Adobe Sign recent-completions
 * surface inside the My Dashboard My Work shell.
 *
 * Contract-only: no fetch, OAuth, or provider logic lives here.
 *
 * @module myWork/AdobeSignRecentCompletions
 */

import type { MyWorkAdobeSignSenderSummary, MyWorkFreshnessState } from './AdobeSignActionQueue.js';

export interface MyWorkAdobeSignRecentCompletionsQuery {
  readonly pageSize?: number;
  readonly cursor?: string;
}

export interface MyWorkAdobeSignRecentCompletionsItem {
  readonly itemId: string;
  readonly sourceSystem: 'adobe-sign';
  readonly agreementId: string;
  readonly agreementName: string;
  readonly agreementStatus: 'COMPLETED';
  readonly sender?: MyWorkAdobeSignSenderSummary;
  readonly completedAtUtc?: string;
  readonly modifiedAtUtc?: string;
  readonly sourceOpenUrl?: string;
}

export interface MyWorkAdobeSignRecentCompletionsSummary {
  readonly countBasis: 'returned-items' | 'provider-total';
  readonly completedAgreementCount: number;
  readonly windowDays: 30;
}

export interface MyWorkAdobeSignRecentCompletionsPagination {
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}

export interface MyWorkAdobeSignRecentCompletionsFreshness {
  readonly state: MyWorkFreshnessState;
  readonly generatedAtUtc: string;
  readonly lastSuccessfulSourceReadAtUtc?: string;
}

export interface MyWorkAdobeSignRecentCompletionsReadModel {
  readonly moduleId: 'adobe-sign-recent-completions';
  readonly summary: MyWorkAdobeSignRecentCompletionsSummary;
  readonly items: readonly MyWorkAdobeSignRecentCompletionsItem[];
  readonly pagination: MyWorkAdobeSignRecentCompletionsPagination;
  readonly freshness: MyWorkAdobeSignRecentCompletionsFreshness;
}
