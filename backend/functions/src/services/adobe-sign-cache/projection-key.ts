/**
 * My Dashboard | Adobe Sign cache — projection key + recipient-action
 * discriminator helpers (B05.15 Prompt 09).
 *
 * Locked grain per package §1.1:
 *
 *   ProjectionKey = `${AdobeActorKey}::${AgreementId}::${RecipientActionKey}`
 *
 * `RecipientActionKey` is the closed `MyWorkAdobeSignRequiredAction` value
 * for action-queue rows (when the agreement carries multiple concurrent
 * recipient actions for the same actor, each gets its own projection
 * row). For recent-completion rows the discriminator is unavailable, so
 * `RecipientActionKey = '__DEFAULT__'` (one row per completed agreement).
 *
 * Pure functions — no I/O.
 *
 * @module services/adobe-sign-cache/projection-key
 */

import {
  MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS,
  type MyWorkAdobeSignActionQueueItem,
  type MyWorkAdobeSignRecentCompletionsItem,
  type MyWorkAdobeSignRequiredAction,
} from '@hbc/models/myWork';

export const RECIPIENT_ACTION_KEY_DEFAULT = '__DEFAULT__' as const;

export type AdobeSignCacheRecipientActionKey =
  | MyWorkAdobeSignRequiredAction
  | typeof RECIPIENT_ACTION_KEY_DEFAULT;

const isNonEmptyTrimmedString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim() === value;

/**
 * Compose the canonical projection key used as the SharePoint
 * `ProjectionKey` column (also the logical uniqueness boundary enforced
 * by the repository layer).
 *
 * Inputs are required and must be non-empty trimmed strings — empty /
 * whitespace inputs throw `RangeError` to surface caller bugs early.
 */
export function computeAdobeSignCacheProjectionKey(input: {
  readonly adobeActorKey: string;
  readonly agreementId: string;
  readonly recipientActionKey: AdobeSignCacheRecipientActionKey;
}): string {
  if (!isNonEmptyTrimmedString(input.adobeActorKey)) {
    throw new RangeError(
      `computeAdobeSignCacheProjectionKey: adobeActorKey must be a non-empty trimmed string (got ${JSON.stringify(input.adobeActorKey)}).`,
    );
  }
  if (!isNonEmptyTrimmedString(input.agreementId)) {
    throw new RangeError(
      `computeAdobeSignCacheProjectionKey: agreementId must be a non-empty trimmed string (got ${JSON.stringify(input.agreementId)}).`,
    );
  }
  if (!isNonEmptyTrimmedString(input.recipientActionKey)) {
    throw new RangeError(
      `computeAdobeSignCacheProjectionKey: recipientActionKey must be a non-empty trimmed string (got ${JSON.stringify(input.recipientActionKey)}).`,
    );
  }
  return `${input.adobeActorKey}::${input.agreementId}::${input.recipientActionKey}`;
}

/**
 * Derive the recipient-action discriminator for an action-queue row. The
 * `MyWorkAdobeSignActionQueueItem.requiredAction` value is one of six
 * locked vocabulary members (`MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS`); the
 * value is returned verbatim. Unknown values are rejected to defend
 * against contract drift.
 */
export function deriveRecipientActionKeyForActionQueue(
  item: Pick<MyWorkAdobeSignActionQueueItem, 'requiredAction'>,
): AdobeSignCacheRecipientActionKey {
  const candidate = item.requiredAction;
  if (
    typeof candidate !== 'string' ||
    !(MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS as readonly string[]).includes(candidate)
  ) {
    throw new RangeError(
      `deriveRecipientActionKeyForActionQueue: unknown requiredAction value (got ${JSON.stringify(candidate)}).`,
    );
  }
  return candidate as MyWorkAdobeSignRequiredAction;
}

/**
 * Derive the recipient-action discriminator for a recent-completion row.
 * Completions are agreement-grain (not action-grain) — always
 * `RECIPIENT_ACTION_KEY_DEFAULT`.
 */
export function deriveRecipientActionKeyForRecentCompletion(
  _item: Pick<MyWorkAdobeSignRecentCompletionsItem, 'agreementId'>,
): typeof RECIPIENT_ACTION_KEY_DEFAULT {
  return RECIPIENT_ACTION_KEY_DEFAULT;
}
