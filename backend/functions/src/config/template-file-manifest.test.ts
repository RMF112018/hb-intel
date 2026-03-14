import { describe, it, expect } from 'vitest';
import { TEMPLATE_FILE_MANIFEST, type ITemplateFileEntry } from './template-file-manifest.js';

describe('TEMPLATE_FILE_MANIFEST', () => {
  it('has exactly 4 entries', () => {
    expect(TEMPLATE_FILE_MANIFEST).toHaveLength(4);
  });

  it('all entries target "Project Documents" library', () => {
    for (const entry of TEMPLATE_FILE_MANIFEST) {
      expect(entry.targetLibrary).toBe('Project Documents');
    }
  });

  it('contains expected file names', () => {
    const fileNames = TEMPLATE_FILE_MANIFEST.map((e) => e.fileName);
    expect(fileNames).toContain('Project Setup Checklist.xlsx');
    expect(fileNames).toContain('Submittal Register Template.xlsx');
    expect(fileNames).toContain('Meeting Agenda Template.docx');
    expect(fileNames).toContain('RFI Log Template.xlsx');
  });

  it('each entry has correct assetPaths matching fileNames', () => {
    for (const entry of TEMPLATE_FILE_MANIFEST) {
      expect(entry.assetPath).toBe(entry.fileName);
    }
  });

  it('every entry satisfies ITemplateFileEntry shape', () => {
    for (const entry of TEMPLATE_FILE_MANIFEST) {
      const typed: ITemplateFileEntry = entry;
      expect(typeof typed.fileName).toBe('string');
      expect(typeof typed.targetLibrary).toBe('string');
      expect(typeof typed.assetPath).toBe('string');
      expect(typed.fileName.length).toBeGreaterThan(0);
      expect(typed.assetPath.length).toBeGreaterThan(0);
    }
  });
});
