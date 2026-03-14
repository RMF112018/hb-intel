import { describe, it, expect } from 'vitest';
import { TEMPLATE_FILE_MANIFEST, type ITemplateFileEntry } from './template-file-manifest.js';

describe('TEMPLATE_FILE_MANIFEST', () => {
  it('has exactly 18 entries', () => {
    expect(TEMPLATE_FILE_MANIFEST).toHaveLength(18);
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

  it('contains T02 startup-family file names', () => {
    const fileNames = TEMPLATE_FILE_MANIFEST.map((e) => e.fileName);
    expect(fileNames).toContain('Estimating Kickoff Template.xlsx');
    expect(fileNames).toContain('Responsibility Matrix Template.xlsx');
    expect(fileNames).toContain('Project Management Plan Template.docx');
    expect(fileNames).toContain('Procore Startup Checklist Reference.pdf');
  });

  it('contains T03 closeout-family file names', () => {
    const fileNames = TEMPLATE_FILE_MANIFEST.map((e) => e.fileName);
    expect(fileNames).toContain('Project Closeout Guide.docx');
    expect(fileNames).toContain('Closeout Checklist Reference.pdf');
  });

  it('contains T04 safety-family file names', () => {
    const fileNames = TEMPLATE_FILE_MANIFEST.map((e) => e.fileName);
    expect(fileNames).toContain('JHA Form Template.docx');
    expect(fileNames).toContain('JHA Instructions.docx');
    expect(fileNames).toContain('Incident Report Form.docx');
    expect(fileNames).toContain('Site Specific Safety Plan Template.docx');
  });

  it('contains T05 project-controls-family file names', () => {
    const fileNames = TEMPLATE_FILE_MANIFEST.map((e) => e.fileName);
    expect(fileNames).toContain('Required Inspections Template.xlsx');
  });

  it('contains T06 financial-family file names', () => {
    const fileNames = TEMPLATE_FILE_MANIFEST.map((e) => e.fileName);
    expect(fileNames).toContain('Buyout Log Template.xlsx');
    expect(fileNames).toContain('Draw Schedule Template.xlsx');
    expect(fileNames).toContain('Financial Forecast Checklist.xlsx');
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
