import fs from 'node:fs/promises';
import path from 'node:path';
import type { PccSurfaceEvidenceBlockRun } from './pcc-live.surface-blocks.types';

const REQUIRED_STATEMENTS = [
  'Final judgment: expert-review-required.',
  'No score calculated.',
  'No EV captured.',
  'No hard stop passed or failed.',
] as const;

function renderHeader(run: PccSurfaceEvidenceBlockRun): string[] {
  return [
    `- Run ID: ${run.runId}`,
    `- Generated: ${run.generatedAtIso}`,
    `- Tenant site: ${run.tenantSiteUrl}`,
    `- Tenant page: ${run.tenantPageUrl}`,
    `- Expected package version: ${run.expectedPackageVersion}`,
    `- EV refs: ${run.evRefs.join(', ')}`,
    '',
    ...REQUIRED_STATEMENTS.map((line) => `- ${line}`),
    `> ${run.disclaimer}`,
    '',
  ];
}

function mdBlock(
  run: PccSurfaceEvidenceBlockRun,
  block: PccSurfaceEvidenceBlockRun['blocks'][number],
): string {
  const lines: string[] = [`# ${block.label}`, ''];
  lines.push(...renderHeader(run));
  lines.push(`- Block ID: ${block.blockId}`);
  lines.push(`- EV ID: ${block.evId}`);
  lines.push(`- Block type: ${block.blockType}`);
  lines.push(`- Surface ID: ${block.surfaceId ?? 'n/a'}`);
  lines.push(`- Primitive scope: ${block.primitiveScope ?? 'n/a'}`);
  lines.push(`- Disposition: ${block.disposition}`);
  lines.push('');

  lines.push('## Artifact References');
  lines.push('| Source lane | Kind | Path | Exists |');
  lines.push('|---|---|---|---|');
  for (const ref of block.artifactRefs) {
    lines.push(`| ${ref.sourceLane} | ${ref.artifactKind} | ${ref.path} | ${ref.exists} |`);
  }
  if (block.artifactRefs.length === 0) {
    lines.push('| - | - | none | false |');
  }
  lines.push('');

  lines.push('## Summary Signals');
  lines.push(`- Screenshot refs: ${block.screenshotSummary.referenceCount}`);
  lines.push(`- Card count: ${block.cardHierarchySummary.cardCount}`);
  lines.push(`- Workflow actions: ${block.workflowSummary.actionCount}`);
  lines.push(`- Accessibility axe violations: ${block.accessibilitySummary.axeViolationCount}`);
  lines.push(`- Breakpoint viewports: ${block.breakpointSummary.viewportCount}`);
  lines.push(`- Runtime warnings: ${block.runtimeSummary.warningCount}`);
  lines.push(`- Content findings: ${block.contentSummary.findingCount}`);
  lines.push(`- Doctrine signals: ${block.doctrineSummary.doctrineSignalCount}`);
  lines.push('');

  lines.push('## Pending Gaps');
  for (const gap of block.pendingGaps) {
    lines.push(`- [${gap.sourceLane}] ${gap.code}: ${gap.message}`);
  }
  if (block.pendingGaps.length === 0) {
    lines.push('- none');
  }
  lines.push('');

  lines.push('## Expert Review Questions');
  for (const q of block.expertReviewQuestions) lines.push(`- ${q}`);
  if (block.expertReviewQuestions.length === 0) lines.push('- none');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

export interface WritePccSurfaceBlocksInput {
  outputDir: string;
  run: PccSurfaceEvidenceBlockRun;
}

export interface WritePccSurfaceBlocksResult {
  outputDir: string;
  evidenceJsonPath: string;
  evidenceMarkdownPath: string;
  surfaceBlockIndexJsonPath: string;
  surfaceBlockIndexMarkdownPath: string;
  blockJsonPaths: string[];
  blockMarkdownPaths: string[];
  primitiveEvidenceSummaryPath: string;
  crossSurfaceGapRegisterPath: string;
}

export async function writePccSurfaceEvidenceBlocks(
  input: WritePccSurfaceBlocksInput,
): Promise<WritePccSurfaceBlocksResult> {
  const outDir = input.outputDir;
  const blocksDir = path.join(outDir, 'blocks');
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(blocksDir, { recursive: true });

  const run = {
    ...input.run,
    blocks: [...input.run.blocks].sort((a, b) => a.evId.localeCompare(b.evId)),
  };

  const evidenceJsonPath = path.join(outDir, 'pcc-live-surface-blocks-evidence.json');
  const evidenceMarkdownPath = path.join(outDir, 'pcc-live-surface-blocks-evidence.md');
  const surfaceBlockIndexJsonPath = path.join(outDir, 'surface-block-index.json');
  const surfaceBlockIndexMarkdownPath = path.join(outDir, 'surface-block-index.md');

  await fs.writeFile(evidenceJsonPath, `${JSON.stringify(run, null, 2)}\n`);
  await fs.writeFile(
    surfaceBlockIndexJsonPath,
    `${JSON.stringify(
      run.blocks.map((b) => ({
        evId: b.evId,
        blockId: b.blockId,
        blockType: b.blockType,
        surfaceId: b.surfaceId,
        primitiveScope: b.primitiveScope,
        disposition: b.disposition,
      })),
      null,
      2,
    )}\n`,
  );

  const rootMd: string[] = ['# PCC Surface/Primitive Evidence Blocks', ''];
  rootMd.push(...renderHeader(run));
  rootMd.push(`- Block count: ${run.blocks.length}`);
  rootMd.push(`- Total artifact refs: ${run.summary.totalArtifactRefs}`);
  rootMd.push(`- Total pending gaps: ${run.summary.totalPendingGaps}`);
  rootMd.push(`- Primitive shared signals: ${run.primitiveSummary.sharedPrimitiveSignalCount}`);
  rootMd.push(`- Cross-surface total gaps: ${run.crossSurfaceSummary.totalPendingGaps}`);
  rootMd.push('');
  rootMd.push('## Blocks');
  for (const block of run.blocks) {
    rootMd.push(`- ${block.evId} — ${block.blockId} (${block.disposition})`);
  }
  await fs.writeFile(evidenceMarkdownPath, `${rootMd.join('\n')}\n`);

  const indexMd: string[] = ['# Surface Block Index', ''];
  indexMd.push(...renderHeader(run));
  indexMd.push('| EV | Block ID | Type | Surface | Disposition |');
  indexMd.push('|---|---|---|---|---|');
  for (const block of run.blocks) {
    indexMd.push(
      `| ${block.evId} | ${block.blockId} | ${block.blockType} | ${block.surfaceId ?? '-'} | ${block.disposition} |`,
    );
  }
  await fs.writeFile(surfaceBlockIndexMarkdownPath, `${indexMd.join('\n')}\n`);

  const blockJsonPaths: string[] = [];
  const blockMarkdownPaths: string[] = [];
  for (const block of run.blocks) {
    const jsonPath = path.join(blocksDir, `${block.blockId}.json`);
    const mdPath = path.join(blocksDir, `${block.blockId}.md`);
    blockJsonPaths.push(jsonPath);
    blockMarkdownPaths.push(mdPath);
    await fs.writeFile(jsonPath, `${JSON.stringify(block, null, 2)}\n`);
    await fs.writeFile(mdPath, mdBlock(run, block));
  }

  const primitiveEvidenceSummaryPath = path.join(outDir, 'primitive-evidence-summary.md');
  const primitiveMd = [
    '# Primitive Evidence Summary',
    '',
    ...renderHeader(run),
    `- Shared primitive signals: ${run.primitiveSummary.sharedPrimitiveSignalCount}`,
    `- Accessibility primitive signals: ${run.primitiveSummary.accessibilityPrimitiveSignalCount}`,
    `- Responsive primitive signals: ${run.primitiveSummary.responsivePrimitiveSignalCount}`,
    `- Card distribution signals: ${run.primitiveSummary.cardDistributionSignalCount}`,
    '',
  ];
  await fs.writeFile(primitiveEvidenceSummaryPath, `${primitiveMd.join('\n')}\n`);

  const crossSurfaceGapRegisterPath = path.join(outDir, 'cross-surface-gap-register.md');
  const gapLines: string[] = ['# Cross-Surface Gap Register', ''];
  gapLines.push(...renderHeader(run));
  for (const block of run.blocks) {
    gapLines.push(`## ${block.blockId}`);
    if (block.pendingGaps.length === 0) {
      gapLines.push('- none');
    } else {
      for (const gap of block.pendingGaps) {
        gapLines.push(`- [${gap.sourceLane}] ${gap.code}: ${gap.message}`);
      }
    }
    gapLines.push('');
  }
  await fs.writeFile(crossSurfaceGapRegisterPath, `${gapLines.join('\n')}\n`);

  return {
    outputDir: outDir,
    evidenceJsonPath,
    evidenceMarkdownPath,
    surfaceBlockIndexJsonPath,
    surfaceBlockIndexMarkdownPath,
    blockJsonPaths,
    blockMarkdownPaths,
    primitiveEvidenceSummaryPath,
    crossSurfaceGapRegisterPath,
  };
}
