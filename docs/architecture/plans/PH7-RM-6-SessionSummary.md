# PH7-RM-6 — Session Summary Screen and Export


> **Doc Classification:** Deferred Scope — remediation scope item identified during Phase 7 but not yet assigned to an active execution phase; confirm scheduling status before PH7.12 sign-off.

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** PH7-RM-5 (Action Items complete), @hbc/ui-kit, navigator.clipboard API
**Blocks:** PH7-RM-7 (Estimating Integration)

---

## Summary

Phase 6 implements the session summary screen and export functionality. When a user clicks the Exit (×) button in Review Mode, instead of immediately closing, the overlay transitions to a full-screen summary view showing session duration, records reviewed per section, and all action items created this session. From this screen, users can copy the summary to clipboard or post it to Microsoft Teams (if webhook is configured). The `lastReviewedAt` timestamp is persisted to each reviewed record via an optional `onMarkReviewed` callback in the review config. After reviewing, the user clicks "Close Review Mode" to fully exit.

## Why It Matters

- **Audit Trail & Accountability**: Session summaries capture review scope, duration, and action item assignments for compliance and team visibility.
- **Outcome Visibility**: Immediate feedback on review impact (records reviewed, action items created) motivates continued use.
- **Cross-Team Communication**: Teams integration allows reviewers to broadcast session results without manual context-switching.
- **Persistence**: `lastReviewedAt` timestamps on records enable managers to track review frequency and identify stale data.
- **Non-Destructive Exit**: Users never accidentally close without seeing what they accomplished.

## Files to Create / Modify

### New Files
1. `packages/review-mode/src/components/SessionSummary/SessionSummaryScreen.tsx`
2. `packages/review-mode/src/components/SessionSummary/useSessionExport.ts`
3. `packages/review-mode/src/components/SessionSummary/index.ts` (barrel)

### Modifications
4. `packages/review-mode/src/context/ReviewModeContext.ts` (add endedAt, close flow)
5. `packages/review-mode/src/components/ReviewModeShell.tsx` (route to summary before closing)

---

## Implementation

### Step 1: Export Hook

#### Create `packages/review-mode/src/components/SessionSummary/useSessionExport.ts`

Utilities for clipboard and Teams integration.

```typescript
import type { ISessionSummary } from '../../types/index.js';

/**
 * useSessionExport hook.
 *
 * Provides utilities for exporting session summary to clipboard or Teams.
 *
 * buildClipboardText(summary): string
 *   Formats session summary as plain text suitable for pasting into email, chat, etc.
 *   Includes: title, date, duration, per-section review counts, action items list.
 *
 * copyToClipboard(summary): Promise<void>
 *   Copies the formatted text to navigator.clipboard.
 *   Shows brief visual confirmation (via toast, inline message, or button state change).
 *
 * postToTeams(summary, webhookUrl): Promise<void>
 *   Posts the session summary to Microsoft Teams via incoming webhook.
 *   Webhook URL sourced from environment variable: VITE_TEAMS_REVIEW_WEBHOOK_URL
 *   Body: Adaptive Card JSON (or simple message card with summary text).
 *
 *   If webhook URL is not configured:
 *     - Teams button is hidden in the UI
 *     - postToTeams gracefully returns without error
 */

/**
 * Format session summary as plain text.
 * Output suitable for clipboard, email, or plain-text chat.
 *
 * Example output:
 * ```
 * ─────────────────────────────────────────
 * Estimating Review — 2026-03-08
 * Duration: 42 minutes
 *
 * Records Reviewed:
 * • Pursuits: 5 of 8 (63%)
 * • Preconstruction: 2 of 3 (67%)
 * • Estimate Log: 0 of 12 (0%)
 *
 * Action Items Created:
 * 1. Follow up with owner on bid bond — Jane Smith — Due: 2026-03-15 — HIGH
 * 2. Update Procore URL for Ocean Towers — John Doe — Due: 2026-03-12 — MEDIUM
 * 3. Review preconstruction scope — Unassigned — Due: None — MEDIUM
 *
 * ─────────────────────────────────────────
 * ```
 */
export function buildClipboardText(summary: ISessionSummary): string {
  const lines: string[] = [
    '─'.repeat(50),
    `${summary.sessionTitle} — ${new Date(summary.startedAt).toLocaleDateString('en-US')}`,
    `Duration: ${summary.elapsedMinutes} minutes`,
    '',
    'Records Reviewed:',
  ];

  // Add per-section stats.
  for (const section of summary.sectionsReviewed) {
    const pct = Math.round((section.reviewedCount / section.totalCount) * 100);
    lines.push(`• ${section.sectionLabel}: ${section.reviewedCount} of ${section.totalCount} (${pct}%)`);
  }

  lines.push('');
  lines.push('Action Items Created:');

  if (summary.actionItemsCreated.length === 0) {
    lines.push('(None)');
  } else {
    summary.actionItemsCreated.forEach((item, index) => {
      const dueStr = item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None';
      const assignedTo = item.assignedToName || 'Unassigned';
      lines.push(`${index + 1}. ${item.title} — ${assignedTo} — Due: ${dueStr} — ${item.priority}`);
    });
  }

  lines.push('');
  lines.push('─'.repeat(50));

  return lines.join('\n');
}

/**
 * Copy session summary to clipboard.
 * Returns promise that resolves when copy is complete.
 *
 * @param summary - ISessionSummary object
 * @returns Promise<void>
 *
 * @example
 * await copyToClipboard(summary);
 * // Show confirmation toast: "Summary copied to clipboard"
 */
export async function copyToClipboard(summary: ISessionSummary): Promise<void> {
  try {
    const text = buildClipboardText(summary);
    await navigator.clipboard.writeText(text);
    // Success — UI should show confirmation toast or button feedback.
  } catch (error) {
    console.error('[SessionSummary] Failed to copy to clipboard:', error);
    throw error; // Caller handles error UI.
  }
}

/**
 * Post session summary to Microsoft Teams via incoming webhook.
 *
 * Webhook URL is read from environment variable:
 *   VITE_TEAMS_REVIEW_WEBHOOK_URL
 *
 * If not configured, this function gracefully returns without error.
 * The "Post to Teams" button should be hidden if webhook is not available.
 *
 * @param summary - ISessionSummary object
 * @returns Promise<void>
 *
 * @example
 * if (teamsWebhookUrl) {
 *   await postToTeams(summary, teamsWebhookUrl);
 * }
 */
export async function postToTeams(summary: ISessionSummary): Promise<void> {
  const webhookUrl = import.meta.env.VITE_TEAMS_REVIEW_WEBHOOK_URL;

  if (!webhookUrl) {
    console.info('[SessionSummary] Teams webhook not configured, skipping post.');
    return;
  }

  try {
    // Simple text-based message card.
    const text = buildClipboardText(summary);
    const payload = {
      text: text, // Teams will render this as formatted text in the card.
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Teams webhook returned ${response.status}`);
    }

    // Success — UI should show confirmation toast: "Posted to Teams"
  } catch (error) {
    console.error('[SessionSummary] Failed to post to Teams:', error);
    throw error; // Caller handles error UI.
  }
}

/**
 * React hook wrapper for export functions.
 * Provides async wrappers with loading state.
 */
export function useSessionExport() {
  const [isCopyingToClipboard, setIsCopyingToClipboard] = React.useState(false);
  const [isPostingToTeams, setIsPostingToTeams] = React.useState(false);
  const [lastError, setLastError] = React.useState<string | null>(null);

  const handleCopyToClipboard = async (summary: ISessionSummary) => {
    setIsCopyingToClipboard(true);
    setLastError(null);
    try {
      await copyToClipboard(summary);
      // Toast would show here.
    } catch (error) {
      setLastError('Failed to copy summary.');
    } finally {
      setIsCopyingToClipboard(false);
    }
  };

  const handlePostToTeams = async (summary: ISessionSummary) => {
    setIsPostingToTeams(true);
    setLastError(null);
    try {
      await postToTeams(summary);
      // Toast would show here.
    } catch (error) {
      setLastError('Failed to post to Teams.');
    } finally {
      setIsPostingToTeams(false);
    }
  };

  return {
    copyToClipboard: handleCopyToClipboard,
    postToTeams: handlePostToTeams,
    isCopyingToClipboard,
    isPostingToTeams,
    lastError,
  };
}
```

Add the import at the top of the file:

```typescript
import React from 'react';
```

### Step 2: Session Summary Screen Component

#### Create `packages/review-mode/src/components/SessionSummary/SessionSummaryScreen.tsx`

Full-screen summary view shown before exiting review mode.

```typescript
import React, { useEffect, useState } from 'react';
import { Button, Card, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, Badge, Text } from '@fluentui/react-components';
import { Copy24Regular, Share24Regular } from '@fluentui/react-icons';
import { useReviewMode } from '../../context/useReviewMode.js';
import { useSessionExport } from './useSessionExport.js';
import type { ISessionSummary } from '../../types/index.js';

/**
 * SessionSummaryScreen component.
 *
 * Full-screen summary view shown after user clicks "Exit" button in Review Mode.
 * Replaces the sidebar + card layout without changing the ReviewModeShell z-index or position.
 *
 * Shows:
 *   - Header: "Session Complete" + session title + date/time
 *   - Section 1: "Session Stats" (4-column grid)
 *       Duration | Records Reviewed | Action Items Created | (per-section breakdown table)
 *   - Section 2: "Action Items Created This Session" (table view if items exist)
 *       Title | Assigned To | Due Date | Priority | Source Record
 *   - Footer: "Copy Summary" button + "Post to Teams" button (conditional) + "Close Review Mode" button (primary)
 *
 * Layout: Vertical scrolling, padded, uses @hbc/ui-kit Card and Table components.
 *
 * Exit Flow:
 *   - User sees the summary
 *   - User can export (clipboard, Teams)
 *   - User clicks "Close Review Mode" to actually close the overlay
 *   - ReviewModeShell unmounts, reveals underlying page
 *   - Session is fully terminated
 *
 * Props: None (pulls from context).
 */
export function SessionSummaryScreen() {
  const { sessionSummary, finalClose } = useReviewMode();
  const { copyToClipboard, postToTeams, isCopyingToClipboard, isPostingToTeams, lastError } =
    useSessionExport();
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showTeamsSuccess, setShowTeamsSuccess] = useState(false);

  if (!sessionSummary) {
    return null; // Should not happen if component is only shown after exit.
  }

  // Auto-hide success messages after 2 seconds.
  useEffect(() => {
    if (showCopySuccess) {
      const timer = setTimeout(() => setShowCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopySuccess]);

  useEffect(() => {
    if (showTeamsSuccess) {
      const timer = setTimeout(() => setShowTeamsSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showTeamsSuccess]);

  const handleCopy = async () => {
    try {
      await copyToClipboard(sessionSummary);
      setShowCopySuccess(true);
    } catch (error) {
      // Error already logged in hook.
    }
  };

  const handlePostToTeams = async () => {
    try {
      await postToTeams(sessionSummary);
      setShowTeamsSuccess(true);
    } catch (error) {
      // Error already logged in hook.
    }
  };

  const teamsWebhookUrl = import.meta.env.VITE_TEAMS_REVIEW_WEBHOOK_URL;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--colorNeutralBackground1)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ padding: 32, borderBottom: '1px solid var(--colorNeutralStroke1)', flexShrink: 0 }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 600 }}>Session Complete</h1>
        <h2 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 500 }}>{sessionSummary.sessionTitle}</h2>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>
          {new Date(sessionSummary.startedAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Content Scroll Area */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        {/* Section 1: Session Stats */}
        <Card>
          <div style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, textTransform: 'uppercase' }}>
              Session Stats
            </h3>

            {/* Summary Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
                marginBottom: 24,
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)', textTransform: 'uppercase' }}>
                  Duration
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 600 }}>
                  {sessionSummary.elapsedMinutes}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>
                  minutes
                </p>
              </div>

              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)', textTransform: 'uppercase' }}>
                  Records Reviewed
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 600 }}>
                  {sessionSummary.sectionsReviewed.reduce((sum, s) => sum + s.reviewedCount, 0)} of{' '}
                  {sessionSummary.sectionsReviewed.reduce((sum, s) => sum + s.totalCount, 0)}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>
                  total records
                </p>
              </div>

              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)', textTransform: 'uppercase' }}>
                  Action Items Created
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 600 }}>
                  {sessionSummary.actionItemsCreated.length}
                </p>
              </div>
            </div>

            {/* Per-Section Breakdown Table */}
            <div>
              <p style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                Per-Section Breakdown
              </p>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--colorNeutralStroke1)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>Section</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600 }}>Reviewed</th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600 }}>Total</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 600 }}>% Complete</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionSummary.sectionsReviewed.map((section) => {
                    const pct = Math.round((section.reviewedCount / section.totalCount) * 100);
                    return (
                      <tr key={section.sectionId} style={{ borderBottom: '1px solid var(--colorNeutralStroke2)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 500 }}>{section.sectionLabel}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>{section.reviewedCount}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>{section.totalCount}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Section 2: Action Items Created This Session */}
        {sessionSummary.actionItemsCreated.length > 0 && (
          <Card>
            <div style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, textTransform: 'uppercase' }}>
                Action Items Created This Session
              </h3>

              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--colorNeutralStroke1)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>Title</th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, width: '150px' }}>
                      Assigned To
                    </th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600, width: '100px' }}>
                      Due Date
                    </th>
                    <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600, width: '100px' }}>
                      Priority
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, width: '150px' }}>
                      Source Record
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessionSummary.actionItemsCreated.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--colorNeutralStroke2)' }}>
                      <td style={{ padding: '8px 12px' }}>{item.title}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--colorNeutralForegroundHint)' }}>
                        {item.assignedToName || 'Unassigned'}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--colorNeutralForegroundHint)' }}>
                        {item.dueDate
                          ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : '—'}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <Badge
                          appearance="outline"
                          color={
                            item.priority === 'High'
                              ? 'danger'
                              : item.priority === 'Medium'
                                ? 'warning'
                                : 'subtle'
                          }
                        >
                          {item.priority}
                        </Badge>
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--colorNeutralForegroundHint)', fontSize: 12 }}>
                        {item.sourceRecordLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Footer Buttons */}
      <div
        style={{
          padding: 32,
          borderTop: '1px solid var(--colorNeutralStroke1)',
          backgroundColor: 'var(--colorNeutralBackground2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          gap: 16,
        }}
      >
        {/* Left side: Export buttons + error message */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastError && <Text style={{ color: 'var(--colorErrorForeground)', fontSize: 12 }}>{lastError}</Text>}
          {showCopySuccess && <Text style={{ color: 'var(--colorSuccessForeground)', fontSize: 12 }}>Copied!</Text>}
          {showTeamsSuccess && <Text style={{ color: 'var(--colorSuccessForeground)', fontSize: 12 }}>Posted to Teams!</Text>}
        </div>

        {/* Right side: Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button
            appearance="secondary"
            icon={<Copy24Regular />}
            onClick={handleCopy}
            disabled={isCopyingToClipboard}
          >
            {isCopyingToClipboard ? 'Copying…' : 'Copy Summary'}
          </Button>

          {teamsWebhookUrl && (
            <Button
              appearance="secondary"
              icon={<Share24Regular />}
              onClick={handlePostToTeams}
              disabled={isPostingToTeams}
            >
              {isPostingToTeams ? 'Posting…' : 'Post to Teams'}
            </Button>
          )}

          <Button appearance="primary" onClick={finalClose}>
            Close Review Mode
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Barrel Export

#### Create `packages/review-mode/src/components/SessionSummary/index.ts`

```typescript
/**
 * Barrel export for session summary components.
 * Internal API (not exported from package root).
 */

export { SessionSummaryScreen } from './SessionSummaryScreen.js';
export { useSessionExport } from './useSessionExport.js';
```

### Step 4: Extend ReviewModeContext

#### Modify `packages/review-mode/src/context/ReviewModeContext.ts`

Add session summary state and exit flow.

```typescript
// In the ISessionSummary interface (in types), ensure it matches:
interface ISessionSummary {
  sessionKey: string;
  sessionTitle: string;
  startedAt: string; // ISO datetime
  endedAt: string; // ISO datetime (set when exiting)
  elapsedMinutes: number; // Computed: (endedAt - startedAt) / 60000
  sectionsReviewed: {
    sectionId: string;
    sectionLabel: string;
    reviewedCount: number;
    totalCount: number;
  }[];
  actionItemsCreated: IActionItem[]; // All items created this session
}

// In ReviewModeContextType, add:
interface ReviewModeContextType {
  // ... existing fields ...

  /**
   * Session summary computed at exit time.
   * Populated when user clicks Exit, before SessionSummaryScreen is shown.
   * Includes all data needed for summary view and export.
   */
  sessionSummary: ISessionSummary | null;

  /**
   * Transition to session summary view (called when user clicks Exit).
   * Computes endedAt, elapsedMinutes, and sectionReviewed counts.
   * Also calls onMarkReviewed on each reviewed record (async, fire-and-forget).
   */
  exitToSummary: () => void;

  /**
   * Close review mode after showing summary (called when user clicks "Close Review Mode" button).
   * Clears session state and removes overlay.
   */
  finalClose: () => void;
}

// In the initial state:
sessionSummary: null,

// In the reducer, add:
case 'EXIT_TO_SUMMARY': {
  // Compute endedAt and elapsedMinutes.
  const endedAt = new Date().toISOString();
  const elapsedMs = new Date(endedAt).getTime() - new Date(state.sessionStartedAt).getTime();
  const elapsedMinutes = Math.round(elapsedMs / (1000 * 60));

  // Build sectionsReviewed array.
  const sectionsReviewed = state.sections.map(section => ({
    sectionId: section.id,
    sectionLabel: section.label,
    reviewedCount: state.reviewedRecordIds.filter(id =>
      state.activeSection === section.id // Count only records marked reviewed in this section.
    ).length,
    totalCount: section.data.length,
  }));

  // Create session summary.
  const summary: ISessionSummary = {
    sessionKey: state.config.sessionKey,
    sessionTitle: state.config.sessionTitle,
    startedAt: state.sessionStartedAt,
    endedAt,
    elapsedMinutes,
    sectionsReviewed,
    actionItemsCreated: state.sessionActionItems,
  };

  // Fire-and-forget: call onMarkReviewed for each reviewed record.
  state.reviewedRecordIds.forEach(recordId => {
    const section = state.sections.find(s => s.data.some(record => record.id === recordId));
    if (section?.onMarkReviewed) {
      section.onMarkReviewed(recordId, endedAt).catch(err =>
        console.warn('[ReviewMode] onMarkReviewed failed for', recordId, err)
      );
    }
  });

  return {
    ...state,
    sessionSummary: summary,
  };
}

case 'FINAL_CLOSE':
  // Reset to initial state.
  return {
    ...initialState,
  };

// In the Provider value:
exitToSummary: () => {
  dispatch({ type: 'EXIT_TO_SUMMARY' });
},
finalClose: () => {
  dispatch({ type: 'FINAL_CLOSE' });
  // Also call onClose callback from context, if provided.
},
```

### Step 5: Update ReviewModeShell

#### Modify `packages/review-mode/src/components/ReviewModeShell.tsx`

Route to summary screen when sessionSummary is set.

```typescript
import { SessionSummaryScreen } from './SessionSummary/SessionSummaryScreen.js';

export function ReviewModeShell() {
  const { isOpen, sessionSummary, exitToSummary } = useReviewMode();

  // ... existing useFullscreen, scroll lock logic ...

  // If session summary is shown, render it instead of the normal layout.
  if (sessionSummary) {
    return <SessionSummaryScreen />;
  }

  return (
    <div
      style={{
        // ... existing fixed position styles ...
      }}
    >
      <ReviewModeHeader onExit={exitToSummary} />
      {/* ... existing sidebar + card layout ... */}
    </div>
  );
}
```

Update the ReviewModeHeader's exit button to call `exitToSummary` instead of `onClose`:

```typescript
// In ReviewModeHeader:
const { exitToSummary } = useReviewMode();

// Exit button onClick:
<Button
  appearance="subtle"
  size="small"
  icon={<Dismiss24Regular />}
  onClick={exitToSummary}
  aria-label="Exit review mode"
/>
```

---

## Verification

### Build and Type Check
```bash
cd packages/review-mode
pnpm build
pnpm typecheck
```

### Integration Test (example)
```bash
# 1. Open review mode in dev-harness with mock data.
# 2. Review several records, mark as reviewed.
# 3. Create 3-4 action items with varied assignments/due dates/priorities.
# 4. Click the Exit (×) button.
# 5. Verify:
#    - Current view transitions to SessionSummaryScreen.
#    - Header shows "Session Complete" + session title.
#    - Stats section shows correct duration, total records reviewed, action item count.
#    - Per-section breakdown table is populated.
#    - Action items table shows all created items with title, assignee, due date, priority, source.
# 6. Click "Copy Summary" button.
#    - "Copied!" message appears for 2 seconds.
#    - Clipboard contents can be pasted (manual test).
# 7. If VITE_TEAMS_REVIEW_WEBHOOK_URL is set:
#    - "Post to Teams" button is visible.
#    - Click it (mock webhook, verify POST is made).
#    - "Posted to Teams!" message appears.
# 8. If webhook is not set:
#    - "Post to Teams" button is hidden.
# 9. Click "Close Review Mode" button.
#    - SessionSummaryScreen unmounts.
#    - ReviewModeShell closes.
#    - Overlay is hidden, underlying page is visible.
```

### Lint and Format
```bash
pnpm lint --fix
pnpm format
```

---

## Definition of Done

- [ ] SessionSummaryScreen component created and renders full summary view.
- [ ] useSessionExport hook provides clipboard copy and Teams webhook integration.
- [ ] buildClipboardText formats summary correctly (plain text, readable layout).
- [ ] copyToClipboard works and shows success confirmation.
- [ ] postToTeams sends payload to webhook (if configured).
- [ ] Teams button hidden when webhook URL is not set.
- [ ] ReviewModeContext extended with sessionSummary state and transitions.
- [ ] Exit flow works: Exit (×) button → summary → Close Review Mode button.
- [ ] onMarkReviewed callback is called for each reviewed record with endedAt timestamp.
- [ ] Per-section review counts are calculated correctly.
- [ ] Action items table displays all items created during session.
- [ ] Build succeeds with no type errors or lint warnings.
- [ ] SessionSummaryScreen renders without console errors in dev-harness.
- [ ] Code follows HB Intel style: @hbc/ui-kit, Fluent UI v9, type safety.
- [ ] All exported functions have JSDoc comments with examples.

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase PH7-RM-6 completed: YYYY-MM-DD
Files created: 3
Session summary screen: complete
Export utilities (clipboard + Teams): complete
Context extensions: summary state + exit flow
Per-section stats: implemented
Action items table: implemented
Next: PH7-RM-7 (Estimating Integration)
-->
