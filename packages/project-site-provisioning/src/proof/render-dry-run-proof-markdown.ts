import {
  NON_EXECUTION_STATEMENT,
  type DryRunProofArtifact,
} from '../contracts/dry-run-proof-artifact.js';
import { OBJECT_PLAN_KEYS } from '../contracts/provisioning-manifest.js';

function fmtScan(result: { ok: boolean; hits: readonly string[] }): string {
  if (result.ok) return 'ok';
  return `failed (${result.hits.length} hits)`;
}

function fmtNullable(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '(none)';
  return String(value);
}

function fmtCheckbox(label: string): string {
  return `- [ ] ${label}`;
}

function tableRow(cells: readonly (string | number)[]): string {
  return `| ${cells.join(' | ')} |`;
}

const OPERATOR_CHECKLIST: readonly string[] = [
  'Confirm template name and version match approved release',
  'Confirm site URL convention matches PCC frozen rule',
  'Confirm all 14 family slots show "planned" status',
  'Confirm plannedHash matches expected baseline (or matches re-derivation)',
  'Confirm all three scans report ok',
  'Confirm no warnings indicate unexpected placeholder coverage',
  'Confirm no blockers',
  'Confirm mutation gate remains locked',
  'Confirm approvalStatus is not-requested or pending — not approved',
];

/**
 * Render the operator-readable Markdown summary for a dry-run proof
 * artifact. Hand-assembled to keep the output deterministic. Emits a
 * trailing newline so the committed baseline matches normal editor
 * expectations and is byte-stable across regeneration.
 */
export function renderDryRunProofMarkdown(artifact: DryRunProofArtifact): string {
  const m = artifact.manifest;
  const ops = artifact.operatorSummary;
  const lines: string[] = [];

  lines.push(`# Project Site Provisioning Dry-Run Proof — ${artifact.artifactId}`);
  lines.push('');
  lines.push('## Artifact identity');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('| --- | --- |');
  lines.push(tableRow(['Artifact kind', artifact.artifactKind]));
  lines.push(tableRow(['Artifact version', artifact.artifactVersion]));
  lines.push(tableRow(['Artifact ID', artifact.artifactId]));
  lines.push(tableRow(['Created at', artifact.createdAt]));
  lines.push(tableRow(['Source commit', fmtNullable(artifact.sourceCommit ?? null)]));
  lines.push(tableRow(['Dry-run only', String(artifact.dryRunOnly)]));
  lines.push(tableRow(['Tenant mutation allowed', String(artifact.tenantMutationAllowed)]));
  lines.push('');

  lines.push('## Source');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('| --- | --- |');
  lines.push(tableRow(['Template package', m.generatedFrom.packageName]));
  lines.push(tableRow(['Template name', m.generatedFrom.templateName]));
  lines.push(tableRow(['Template version', m.generatedFrom.templateVersion]));
  lines.push(tableRow(['Contract ref', m.generatedFrom.contractRef]));
  lines.push(tableRow(['Source commit', fmtNullable(m.generatedFrom.sourceCommit ?? null)]));
  lines.push('');

  lines.push('## Manifest version');
  lines.push('');
  lines.push(`\`${m.manifestVersion}\``);
  lines.push('');

  lines.push('## Mutation gate');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('| --- | --- |');
  lines.push(tableRow(['mutationLocked', String(m.mutationGate.mutationLocked)]));
  lines.push(tableRow(['liveMutationAllowed', String(m.mutationGate.liveMutationAllowed)]));
  lines.push(tableRow(['requiresHumanApproval', String(m.mutationGate.requiresHumanApproval)]));
  lines.push(tableRow(['approvalStatus', artifact.approvalState.approvalStatus]));
  lines.push(tableRow(['approvedBy', fmtNullable(artifact.approvalState.approvedBy)]));
  lines.push(tableRow(['approvedAt', fmtNullable(artifact.approvalState.approvedAt)]));
  lines.push(tableRow(['approvalRef', fmtNullable(artifact.approvalState.approvalRef)]));
  lines.push('');

  lines.push('## Site plan');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('| --- | --- |');
  lines.push(tableRow(['Plan status', m.sitePlan.status]));
  lines.push(tableRow(['Input project number', fmtNullable(ops.site.inputProjectNumber)]));
  lines.push(tableRow(['Project base number', fmtNullable(ops.site.projectBaseNumber)]));
  lines.push(tableRow(['Project base number (no hyphen)', fmtNullable(ops.site.projectBaseNumberNoHyphen)]));
  lines.push(tableRow(['Resolved URL', fmtNullable(ops.site.url)]));
  lines.push(tableRow(['URL status', ops.site.urlStatus]));
  lines.push(tableRow(['Resolved title', fmtNullable(ops.site.title)]));
  lines.push(tableRow(['Title status', ops.site.titleStatus]));
  lines.push('');

  lines.push('## Object plan coverage');
  lines.push('');
  lines.push('| Family | Status | Entries | Field count | Required | Optional |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const key of OBJECT_PLAN_KEYS) {
    const row = ops.objectPlanCoverage.find((r) => r.family === key);
    if (!row) {
      lines.push(tableRow([key, '(missing)', 0, '(n/a)', '(n/a)', '(n/a)']));
      continue;
    }
    lines.push(
      tableRow([
        row.family,
        row.status,
        row.entryCount,
        row.fieldCount ?? '(n/a)',
        row.requiredFieldCount ?? '(n/a)',
        row.optionalFieldCount ?? '(n/a)',
      ]),
    );
  }
  lines.push('');

  lines.push('## Integrity and scans');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('| --- | --- |');
  lines.push(tableRow(['plannedHash', ops.plannedHash]));
  lines.push(tableRow(['Hash algorithm', ops.hashAlgorithm]));
  lines.push(tableRow(['noSecretScan', fmtScan(ops.scans.noSecretScan)]));
  lines.push(tableRow(['noProcoreMirrorScan', fmtScan(ops.scans.noProcoreMirrorScan)]));
  lines.push(tableRow(['noTenantMutationScan', fmtScan(ops.scans.noTenantMutationScan)]));
  lines.push('');

  lines.push('## Source coverage');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('| --- | --- |');
  lines.push(tableRow(['Contract families declared', ops.sourceCoverage.contractFamiliesDeclared]));
  lines.push(tableRow(['Fixtures processed', ops.sourceCoverage.fixturesProcessed]));
  lines.push(tableRow(['Field maps processed', ops.sourceCoverage.fieldMapsProcessed]));
  lines.push(tableRow(['Object catalog rows processed', ops.sourceCoverage.objectCatalogRowsProcessed]));
  lines.push('');

  lines.push('## Warnings');
  lines.push('');
  if (m.warnings.length === 0) {
    lines.push('(none)');
  } else {
    for (const w of m.warnings) lines.push(`- ${w}`);
  }
  lines.push('');

  lines.push('## Blockers');
  lines.push('');
  if (m.blockers.length === 0) {
    lines.push('(none)');
  } else {
    for (const b of m.blockers) lines.push(`- ${b}`);
  }
  lines.push('');

  lines.push('## Operator review checklist');
  lines.push('');
  for (const item of OPERATOR_CHECKLIST) lines.push(fmtCheckbox(item));
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push(NON_EXECUTION_STATEMENT);
  lines.push('');

  return lines.join('\n');
}
