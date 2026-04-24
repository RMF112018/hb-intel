import { useCallback, useState, type ReactNode } from 'react';
import { HbcButton, HbcTypography } from '@hbc/ui-kit';
import {
  composeSupportPayload,
  supportDetailLines,
  type SupportDetails,
} from '../pages/supportTruth.js';

/**
 * SupportDetailsPanel — Safety-local diagnostic disclosure.
 *
 * Wraps a `<details>` element whose summary opens the allow-listed
 * diagnostic fields carried by `SupportDetails`. The panel:
 *   - surfaces a first-class `suggestedAction` line so operators see the
 *     intended next step before the technical bullets
 *   - renders bullets derived from `supportDetailLines` so only safe
 *     fields (requestIds, failure classes, route, status, attempts,
 *     timestamp) appear — never `message` free-text or `graphContext`
 *   - exposes a copy-to-clipboard affordance that writes the sanitized
 *     payload produced by `composeSupportPayload` so the user can send
 *     it to IT/support without leaking secrets
 *
 * Kept Safety-local per `@hbc/ui-kit` ownership — this is a composition of
 * shared primitives, not a reusable primitive itself.
 */

export interface SupportDetailsPanelProps {
  readonly details: SupportDetails;
  readonly suggestedAction?: string;
  readonly label?: string;
  readonly onCopy?: (ok: boolean) => void;
  readonly 'data-safety-ui'?: string;
}

type CopyFeedback = 'idle' | 'copied' | 'failed';

async function writeClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to textarea fallback
    }
  }
  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function SupportDetailsPanel({
  details,
  suggestedAction,
  label = 'Support details',
  onCopy,
  'data-safety-ui': dataSafetyUi,
}: SupportDetailsPanelProps): ReactNode {
  const [feedback, setFeedback] = useState<CopyFeedback>('idle');
  const lines = supportDetailLines(details);
  const hasAnyField = lines.length > 0 || !!suggestedAction;
  const fallbackLine = hasAnyField
    ? null
    : 'No additional diagnostic details were returned. Contact support with the timestamp.';

  const handleCopy = useCallback(async () => {
    const payload = composeSupportPayload(details, { suggestedAction });
    const ok = await writeClipboard(payload);
    setFeedback(ok ? 'copied' : 'failed');
    onCopy?.(ok);
  }, [details, suggestedAction, onCopy]);

  const feedbackText =
    feedback === 'copied'
      ? 'Support payload copied to clipboard.'
      : feedback === 'failed'
        ? 'Copy failed; select the text manually.'
        : '';

  return (
    <details data-safety-ui={dataSafetyUi ?? 'support-details'}>
      <summary>{label}</summary>
      {suggestedAction && (
        <div data-safety-ui="support-details-suggested-action">
          <HbcTypography intent="label">Suggested next step</HbcTypography>
          <HbcTypography intent="body">{suggestedAction}</HbcTypography>
        </div>
      )}
      {fallbackLine ? (
        <HbcTypography intent="bodySmall">{fallbackLine}</HbcTypography>
      ) : (
        <ul>
          {lines.map((item) => (
            <li key={item}>
              <HbcTypography intent="bodySmall">{item}</HbcTypography>
            </li>
          ))}
        </ul>
      )}
      <div>
        <HbcButton
          variant="secondary"
          onClick={() => void handleCopy()}
        >
          Copy support payload
        </HbcButton>
      </div>
      <div
        role="status"
        aria-live="polite"
        aria-atomic={true}
        data-safety-ui="support-details-copy-feedback"
      >
        {feedbackText}
      </div>
    </details>
  );
}
