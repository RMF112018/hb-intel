/**
 * Wave 7 / Prompt 04 — Document Control permissions & guardrails card.
 *
 * Renders three sections from the document-control read-model view-model:
 *
 *   1. Hard-no guardrails  — `viewModel.hardNoRules`
 *   2. Action catalog       — `viewModel.actionCatalog` grouped by family
 *   3. Role × action availability — `viewModel.roleActionAvailability`
 *      paired with the static role legend (DOCUMENT_CONTROL_ROLE_CODES /
 *      DOCUMENT_CONTROL_ROLE_VOCABULARY) and the availability code legend.
 *
 * This is **read-model rendering only**. The card takes no persona /
 * current-user-role prop and applies no local authorization filtering.
 * No buttons, no anchors, no executable handlers.
 *
 * When `viewModel` is undefined (no read-model client mounted), the card
 * still renders a Wave 7 fallback set of three hard-no rules plus the
 * static role legend and availability legend, so the surface remains
 * informative in fixture-only mode.
 */

import type { FC } from 'react';
import { DOCUMENT_CONTROL_ROLE_CODES, DOCUMENT_CONTROL_ROLE_VOCABULARY } from '@hbc/models/pcc';
import type {
  IDocumentControlActionCode,
  IDocumentControlUniversalHardNoRule,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import styles from './PccDocumentsSurface.module.css';
import {
  DOCUMENT_CONTROL_AVAILABILITY_LEGEND,
  type IPccDocumentControlViewModel,
} from './documentControlViewModel';

/**
 * Wave 7-specific hard-no fallback. Used only when `viewModel` is
 * undefined. Hard-coded as a local constant — NOT imported from
 * `DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES` — because the universal
 * registry is a superset (HN-04 et al.) while the Wave 7 fixture/read-
 * model publishes exactly HN-01..HN-03. Keeping the fallback aligned to
 * the wave's expected set avoids surface-level inconsistency.
 */
const WAVE7_HARD_NO_FALLBACK: readonly IDocumentControlUniversalHardNoRule[] = [
  {
    id: 'HN-01',
    title: 'No My Project Files root browsing in project-site UI',
    description: "Project-site instances must not expose the full 'My Project Files' root.",
  },
  {
    id: 'HN-02',
    title: 'No other-project folder browsing in project-site UI',
    description: 'Project-site instances must not expose folders mapped to other projects.',
  },
  {
    id: 'HN-03',
    title: 'No external writeback or sync in Wave 7',
    description:
      'External platforms remain launch/deep-link visibility only with no mirror/sync/writeback.',
  },
];

const ACTION_FAMILY_TITLES: Readonly<Record<string, string>> = {
  PR: 'Project Record',
  MP: 'My Project Files',
  SB: 'Source Binding / Repair',
  EX: 'External Platforms',
  WF: 'Workflow / Admin',
};

const FORBIDDEN_ACTION_CODES: ReadonlySet<string> = new Set(['EX04']);

function availabilityLabel(code: string): string {
  const entry = DOCUMENT_CONTROL_AVAILABILITY_LEGEND.find((row) => row.code === code);
  return entry?.label ?? code;
}

export interface PccDocumentControlPermissionsCardProps {
  readonly viewModel?: IPccDocumentControlViewModel;
}

export const PccDocumentControlPermissionsCard: FC<PccDocumentControlPermissionsCardProps> = ({
  viewModel,
}) => {
  const hardNoRules = viewModel?.hardNoRules?.length
    ? viewModel.hardNoRules
    : WAVE7_HARD_NO_FALLBACK;
  const actionCatalog = viewModel?.actionCatalog ?? [];
  const roleActionAvailability = viewModel?.roleActionAvailability ?? [];
  // Role legend is always rendered from canonical model constants —
  // not gated on viewModel presence — so the surface remains
  // informative even in the fallback (no-readModelClient) path.
  const roleVocabulary = viewModel?.roleVocabulary ?? DOCUMENT_CONTROL_ROLE_VOCABULARY;
  const roleCodes = viewModel?.roleCodes ?? DOCUMENT_CONTROL_ROLE_CODES;

  // Group action catalog by family, preserving model-emitted order.
  const familyOrder: string[] = [];
  const familyGroups: Record<string, IDocumentControlActionCode[]> = {};
  for (const action of actionCatalog) {
    const family = action.family;
    if (!familyGroups[family]) {
      familyOrder.push(family);
      familyGroups[family] = [];
    }
    familyGroups[family]!.push(action);
  }

  return (
    <PccDashboardCard
      footprint="detail"
      tier="tier3"
      region="detail"
      eyebrow="Permissions & Guardrails"
      title="Permissions & Guardrails"
    >
      <div className={styles.headerCopy} data-pcc-doc-permissions-card="true">
        <p className={styles.laneDescription}>
          Document control role and action availability with hard-no guardrails. Permission changes
          are managed by your PCC administrator.
        </p>

        {/* 1. Hard-no guardrails */}
        <section data-pcc-doc-permissions-section="hard-no">
          <h4 className={styles.laneTitle}>Hard-no guardrails</h4>
          <ul className={styles.metaList}>
            {hardNoRules.map((rule) => (
              <li key={rule.id} className={styles.metaRow} data-pcc-doc-hard-no-id={rule.id}>
                <span className={styles.metaLabel}>{rule.id}</span>
                <span>· {rule.title}</span>
                <span className={styles.guardrail}>{rule.description}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 2. Action catalog grouped by family */}
        <section data-pcc-doc-permissions-section="action-catalog">
          <h4 className={styles.laneTitle}>Action catalog</h4>
          {familyOrder.length === 0 ? (
            <p className={styles.guardrail} data-pcc-doc-action-catalog-empty="true">
              No data to display.
            </p>
          ) : (
            familyOrder.map((family) => (
              <div key={family} data-pcc-doc-action-family={family}>
                <p className={styles.metaLabel}>
                  {family} — {ACTION_FAMILY_TITLES[family] ?? family}
                </p>
                <ul className={styles.metaList}>
                  {(familyGroups[family] ?? []).map((action) => {
                    const forbidden = FORBIDDEN_ACTION_CODES.has(action.code);
                    return (
                      <li
                        key={action.code}
                        className={styles.metaRow}
                        data-pcc-doc-action={action.code}
                        data-pcc-doc-action-family={family}
                        {...(forbidden ? { 'data-pcc-doc-action-forbidden': 'true' } : {})}
                      >
                        <span className={styles.metaLabel}>{action.code}</span>
                        <span>· {action.label}</span>
                        {forbidden ? (
                          <span className={styles.guardrail}>Not allowed</span>
                        ) : (
                          <span className={styles.guardrail}>{action.description}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </section>

        {/* 3. Role × action availability */}
        <section data-pcc-doc-permissions-section="role-action-availability">
          <h4 className={styles.laneTitle}>Role / action availability</h4>
          {roleActionAvailability.length === 0 ? (
            <p className={styles.guardrail} data-pcc-doc-role-action-availability-empty="true">
              No data to display.
            </p>
          ) : (
            <ul className={styles.metaList}>
              {roleActionAvailability.map((row) => {
                const roleLabel = roleVocabulary?.[row.roleCode]?.label ?? row.roleCode;
                const label = availabilityLabel(row.availability);
                return (
                  <li
                    key={`${row.roleCode}-${row.actionCode}`}
                    className={styles.metaRow}
                    data-pcc-doc-role-action-row={`${row.roleCode}-${row.actionCode}`}
                    data-pcc-doc-role-action-availability={row.availability}
                  >
                    <span className={styles.metaLabel}>
                      {row.roleCode} {roleLabel}
                    </span>
                    <span>· {row.actionCode}</span>
                    <span>· {row.availability}</span>
                    <span className={styles.guardrail}>{label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Role legend (always rendered from canonical model order) */}
        <section data-pcc-doc-permissions-section="role-legend">
          <h4 className={styles.laneTitle}>Role legend</h4>
          <ul className={styles.metaList}>
            {(roleCodes ?? []).map((code) => {
              const entry = roleVocabulary?.[code];
              return (
                <li key={code} className={styles.metaRow} data-pcc-doc-role-legend-code={code}>
                  <span className={styles.metaLabel}>{code}</span>
                  <span>· {entry?.label ?? code}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Availability code legend */}
        <section data-pcc-doc-permissions-section="availability-legend">
          <h4 className={styles.laneTitle}>Availability codes</h4>
          <ul className={styles.metaList}>
            {DOCUMENT_CONTROL_AVAILABILITY_LEGEND.map((entry) => (
              <li
                key={entry.code}
                className={styles.metaRow}
                data-pcc-doc-availability-legend-code={entry.code}
              >
                <span className={styles.metaLabel}>{entry.code}</span>
                <span>· {entry.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PccDashboardCard>
  );
};

// Internal type alias used for the family-grouping mutation. Keeps the
// public `IDocumentControlActionCode[]` readonly while we accumulate
// per-family entries internally.
type IDocumentControlActionCodeMutable = IPccDocumentControlViewModel['actionCatalog'][number];

export default PccDocumentControlPermissionsCard;
