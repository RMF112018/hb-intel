import { describe, expect, it } from 'vitest';
import { type PccModuleId } from '@hbc/models/pcc';
import { resolveExplorerFocusTarget } from '../surfaces/documents/documentExplorerModuleFocus';

describe('documentExplorerModuleFocus — locked Prompt 10D mapping', () => {
  it('primary-documents focuses Document Control Home', () => {
    expect(resolveExplorerFocusTarget('primary-documents')).toEqual({
      kind: 'explorer-source',
      sourceId: 'home',
    });
  });

  it('document-control-center focuses Document Control Home', () => {
    expect(resolveExplorerFocusTarget('document-control-center')).toEqual({
      kind: 'explorer-source',
      sourceId: 'home',
    });
  });

  it('sharepoint-project-record focuses Project Record root', () => {
    expect(resolveExplorerFocusTarget('sharepoint-project-record')).toEqual({
      kind: 'explorer-source',
      sourceId: 'project-record',
    });
  });

  it('my-project-files focuses My Project Files root', () => {
    expect(resolveExplorerFocusTarget('my-project-files')).toEqual({
      kind: 'explorer-source',
      sourceId: 'my-project-files',
    });
  });

  it('procore-documents focuses Procore root with initial Documents path', () => {
    expect(resolveExplorerFocusTarget('procore-documents')).toEqual({
      kind: 'explorer-source',
      sourceId: 'procore',
      initialRelativePath: ['documents'],
    });
  });

  it('document-crunch resolves as external-reference (no explorer source focus)', () => {
    expect(resolveExplorerFocusTarget('document-crunch')).toEqual({
      kind: 'external-reference',
      moduleId: 'document-crunch',
    });
  });

  it('adobe-sign resolves as external-reference (no explorer source focus)', () => {
    expect(resolveExplorerFocusTarget('adobe-sign')).toEqual({
      kind: 'external-reference',
      moduleId: 'adobe-sign',
    });
  });

  it('drawing-model-center resolves as deferred (no fabricated focus)', () => {
    expect(resolveExplorerFocusTarget('drawing-model-center')).toEqual({
      kind: 'deferred',
      moduleId: 'drawing-model-center',
    });
  });

  it('unrelated module ids return undefined', () => {
    const unrelated: readonly PccModuleId[] = [
      'action-center',
      'team-access',
      'site-health',
      'hbi-assistant',
    ];
    for (const id of unrelated) {
      expect(resolveExplorerFocusTarget(id)).toBeUndefined();
    }
  });
});
