import fs from 'node:fs/promises';
import path from 'node:path';
import {
  PCC_SCORECARD_REPORT_DISCLAIMER,
  PCC_SCORECARD_REPORT_OUTPUT_FILES,
  type AssemblePccScorecardReportInput,
  assemblePccScorecardReport,
} from './pcc-live.scorecard-report-assembler';
import type { PccScorecardReportRun } from './pcc-live.scorecard-report.types';

const REQUIRED_MD_LINES = [
  'Final judgment: expert-review-required.',
  'No score calculated.',
  'No EV captured by Prompt 13.',
  'No hard stop passed or failed.',
] as const;

function sortRun(run: PccScorecardReportRun): PccScorecardReportRun {
  return {
    ...run,
    evidenceCoverage: [...run.evidenceCoverage].sort(
      (a, b) => Number(a.evidenceId.slice(3)) - Number(b.evidenceId.slice(3)),
    ),
    pillarRows: [...run.pillarRows].sort((a, b) => a.pillarId.localeCompare(b.pillarId)),
    hardStopRows: [...run.hardStopRows].sort((a, b) => a.hardStopId.localeCompare(b.hardStopId)),
    expertScoringWorksheet: [...run.expertScoringWorksheet].sort((a, b) =>
      a.pillarId.localeCompare(b.pillarId),
    ),
    artifactInventory: [...run.artifactInventory].sort((a, b) =>
      (a.sourceLane + a.path).localeCompare(b.sourceLane + b.path),
    ),
    auditPackageIndex: [...run.auditPackageIndex].sort((a, b) => a.file.localeCompare(b.file)),
  };
}

function mdHeader(run: PccScorecardReportRun): string[] {
  return [
    `- Run ID: ${run.runId}`,
    `- Generated: ${run.generatedAtIso}`,
    `- Tenant site: ${run.tenantSiteUrl}`,
    `- Tenant page: ${run.tenantPageUrl}`,
    `- Expected package version: ${run.expectedPackageVersion}`,
    `- Required evidence count: ${run.requiredEvidenceCount}`,
    `- Registered evidence count: ${run.registryEvidenceCount}`,
    `- Artifact references: ${run.summary.artifactReferenceCount}`,
    '',
    ...REQUIRED_MD_LINES.map((line) => `- ${line}`),
    `> ${PCC_SCORECARD_REPORT_DISCLAIMER}`,
    '',
  ];
}

function matrixMd(run: PccScorecardReportRun): string {
  const lines: string[] = ['# Evidence Coverage Matrix', ''];
  lines.push(...mdHeader(run));
  lines.push('| EV | Registry status | Coverage | Artifacts |');
  lines.push('|---|---|---|---|');
  for (const row of run.evidenceCoverage) {
    lines.push(
      `| ${row.evidenceId} | ${row.registryStatus} | ${row.coverageDisposition} | ${row.artifactReferenceCount} |`,
    );
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function worksheetMd(run: PccScorecardReportRun): string {
  const lines: string[] = ['# Expert Scoring Worksheet', ''];
  lines.push(...mdHeader(run));
  lines.push('| Pillar | Title | Weight | Manual score | Owner |');
  lines.push('|---|---|---|---|---|');
  for (const row of run.expertScoringWorksheet) {
    lines.push(
      `| ${row.pillarId} | ${row.pillarTitle} | ${row.weight} | null | ${row.reviewerOwner} |`,
    );
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export interface WritePccScorecardReportInput {
  outputDir: string;
  run?: PccScorecardReportRun;
  assembleInput?: AssemblePccScorecardReportInput;
}

export interface WritePccScorecardReportResult {
  outputDir: string;
  run: PccScorecardReportRun;
  files: string[];
}

export async function writePccScorecardReport(
  input: WritePccScorecardReportInput,
): Promise<WritePccScorecardReportResult> {
  const run = sortRun(input.run ?? assemblePccScorecardReport(input.assembleInput));
  const outDir = input.outputDir;
  await fs.mkdir(outDir, { recursive: true });

  const writeJson = async (file: string, data: unknown): Promise<string> => {
    const full = path.join(outDir, file);
    await fs.writeFile(full, `${JSON.stringify(data, null, 2)}\n`);
    return full;
  };

  const writeMd = async (file: string, lines: string[]): Promise<string> => {
    const full = path.join(outDir, file);
    await fs.writeFile(full, `${lines.join('\n')}\n`);
    return full;
  };

  const files: string[] = [];
  files.push(await writeJson('pcc-live-scorecard-report.json', run));
  files.push(
    await writeMd('pcc-live-scorecard-report.md', [
      '# PCC Scorecard Report',
      '',
      ...mdHeader(run),
      '## 1. Purpose',
      'Assemble a deterministic audit package for expert manual scoring.',
      '## 2. Scope',
      'Registry, traceability, lane summaries, and artifact inventory.',
      '## 3. Inputs Used',
      '- Evidence registry and traceability mappings',
      '- Optional prior-lane artifact references',
      '## 4. Evidence Coverage Summary',
      `- Required evidence rows: ${run.summary.requiredEvidenceCount}`,
      `- Referenced evidence rows: ${run.summary.evidenceReferencedCount}`,
      '## 5. Pillar Review Summary',
      `- Pillar rows: ${run.summary.pillarCount}`,
      '## 6. Hard-Stop Manual Review Summary',
      `- Hard-stop rows: ${run.summary.hardStopCount}`,
      '## 7. Surface / Primitive Evidence Block Summary',
      '- Referenced through artifact inventory when provided.',
      '## 8. Doctrine / Mold Breaker Review Summary',
      '- Referenced through artifact inventory when provided.',
      '## 9. Content / HBI / Source-of-Record Review Summary',
      '- Referenced through artifact inventory when provided.',
      '## 10. Findings Register Summary',
      `- Findings count: ${run.summary.findingCount}`,
      '## 11. Residual Risk Summary',
      `- Residual risk count: ${run.summary.residualRiskCount}`,
      '## 12. Expert Review Instructions',
      '- Populate pillar manual scores in worksheet.',
      '- Keep hard-stop statuses manual-review-required until expert adjudication.',
      '## 13. Final Judgment',
      'Final judgment: expert-review-required.',
      '',
    ]),
  );
  files.push(
    await writeMd('executive-review-summary.md', [
      '# Executive Review Summary',
      '',
      ...mdHeader(run),
      '- Evidence package assembled for expert review.',
      '- Expert scoring remains required.',
      '- Hard-stop review remains required.',
      '- No final score has been calculated.',
      '- This is an audit package, not a readiness claim.',
      '',
    ]),
  );
  files.push(await writeJson('audit-package-index.json', run.auditPackageIndex));
  files.push(
    await writeMd('audit-package-index.md', [
      '# Audit Package Index',
      '',
      ...mdHeader(run),
      '| File | Kind | Lane | Required |',
      '|---|---|---|---|',
      ...run.auditPackageIndex.map(
        (item) => `| ${item.file} | ${item.artifactKind} | ${item.sourceLane} | ${item.required} |`,
      ),
      '',
    ]),
  );
  files.push(await writeJson('evidence-coverage-matrix.json', run.evidenceCoverage));
  files.push(await writeMd('evidence-coverage-matrix.md', matrixMd(run).split('\n')));
  files.push(await writeJson('pillar-evidence-map.json', run.pillarRows));
  files.push(
    await writeMd('pillar-evidence-map.md', [
      '# Pillar Evidence Map',
      '',
      ...mdHeader(run),
      '| Pillar | Weight | Evidence count | Manual score |',
      '|---|---|---|---|',
      ...run.pillarRows.map(
        (row) => `| ${row.pillarId} | ${row.weight} | ${row.evidenceIds.length} | null |`,
      ),
      '',
    ]),
  );
  files.push(await writeJson('hard-stop-worksheet.json', run.hardStopRows));
  files.push(
    await writeMd('hard-stop-worksheet.md', [
      '# Hard-Stop Worksheet',
      '',
      ...mdHeader(run),
      '| Hard stop | Review status | Evidence count |',
      '|---|---|---|',
      ...run.hardStopRows.map(
        (row) => `| ${row.hardStopId} | ${row.reviewStatus} | ${row.evidenceIds.length} |`,
      ),
      '',
    ]),
  );
  files.push(await writeJson('expert-scoring-worksheet.json', run.expertScoringWorksheet));
  files.push(await writeMd('expert-scoring-worksheet.md', worksheetMd(run).split('\n')));
  files.push(await writeJson('findings-register.json', run.findings));
  files.push(
    await writeMd('findings-register.md', [
      '# Findings Register',
      '',
      ...mdHeader(run),
      ...run.findings.map((f) => `- [${f.disposition}] (${f.sourceLane}) ${f.title}: ${f.detail}`),
      '',
    ]),
  );
  files.push(await writeJson('residual-risk-register.json', run.residualRisks));
  files.push(
    await writeMd('residual-risk-register.md', [
      '# Residual Risk Register',
      '',
      ...mdHeader(run),
      ...run.residualRisks.map(
        (r) => `- [${r.disposition}] ${r.statement} Mitigation: ${r.mitigation}`,
      ),
      '',
    ]),
  );
  files.push(await writeJson('artifact-inventory.json', run.artifactInventory));
  files.push(
    await writeMd('artifact-inventory.md', [
      '# Artifact Inventory',
      '',
      ...mdHeader(run),
      '| Lane | Kind | Path | Exists |',
      '|---|---|---|---|',
      ...run.artifactInventory.map(
        (item) => `| ${item.sourceLane} | ${item.artifactKind} | ${item.path} | ${item.exists} |`,
      ),
      '',
    ]),
  );
  files.push(
    await writeMd('manual-review-checklist.md', [
      '# Manual Review Checklist',
      '',
      ...mdHeader(run),
      '- [ ] Confirm all EV coverage rows.',
      '- [ ] Review each of 9 pillar scoring rows.',
      '- [ ] Review each of 10 hard stops.',
      '- [ ] Inspect surface/primitive blocks.',
      '- [ ] Review doctrine/source/Mold Breaker artifacts.',
      '- [ ] Review content/HBI/source-of-record artifacts.',
      '- [ ] Record expert scores manually.',
      '- [ ] Record hard-stop dispositions manually.',
      '- [ ] Decide whether additional evidence is needed.',
      '',
    ]),
  );
  files.push(
    await writeMd('final-report-readme.md', [
      '# Final Report README',
      '',
      ...mdHeader(run),
      '- Package assembled for expert review workflow.',
      '- Final score and hard-stop outcomes remain manual decisions.',
      '- Use worksheet and registers to complete expert adjudication.',
      '',
    ]),
  );

  const expected = [...PCC_SCORECARD_REPORT_OUTPUT_FILES].sort();
  const actual = files.map((full) => path.basename(full)).sort();
  if (expected.join('|') !== actual.join('|')) {
    throw new Error('Prompt 13 writer output set mismatch.');
  }

  return { outputDir: outDir, run, files };
}
