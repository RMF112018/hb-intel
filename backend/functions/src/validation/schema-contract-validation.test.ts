import { describe, it, expect } from 'vitest';
import { HB_INTEL_WORKFLOW_LIST_DEFINITIONS } from '../config/workflow-list-definitions.js';
import { HB_INTEL_LIST_DEFINITIONS } from '../config/list-definitions.js';
import { ADD_ON_DEFINITIONS } from '../config/add-on-definitions.js';
import { CORE_LIBRARIES } from '../config/core-libraries.js';
import { TEMPLATE_FILE_MANIFEST } from '../config/template-file-manifest.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * W0-G2-T09: Schema/config contract tests for G2 provisioning.
 * Fills T09 gap test cases not covered by existing list-definitions, workflow-list-definitions,
 * or validation tests.
 */
describe('W0-G2-T09: Schema contract validation', () => {
  const allWorkflowLists = HB_INTEL_WORKFLOW_LIST_DEFINITIONS;
  const allLists = [...HB_INTEL_LIST_DEFINITIONS, ...allWorkflowLists];

  it('TC-SCHEMA-05: pid displayName === "Project ID" for all 26 workflow lists', () => {
    expect(allWorkflowLists).toHaveLength(26);

    for (const list of allWorkflowLists) {
      const pidField = list.fields.find((f) => f.internalName === 'pid');
      expect(pidField, `${list.title} must have a pid field`).toBeDefined();
      expect(pidField!.displayName).toBe('Project ID');
    }
  });

  it('TC-SCHEMA-06: majority of G2 workflow lists have a Status field', () => {
    // Repo truth: some lists are non-workflow-state entities (role matrices, child detail
    // records, evaluation tables) and intentionally omit Status. Document exceptions here.
    const listsWithStatus = allWorkflowLists.filter((l) =>
      l.fields.some((f) => f.internalName === 'Status')
    );
    const listsWithoutStatus = allWorkflowLists.filter(
      (l) => !l.fields.some((f) => f.internalName === 'Status')
    );

    // At least 80% of workflow lists must have Status (repo truth: ~21 of 26)
    expect(listsWithStatus.length).toBeGreaterThanOrEqual(20);

    // Document all exceptions — this list must not grow without review
    const exceptionTitles = listsWithoutStatus.map((l) => l.title).sort();
    expect(exceptionTitles).toMatchSnapshot();
  });

  it('TC-SCHEMA-08: 6 child lists have a ParentRecord Lookup field', () => {
    const expectedChildren = [
      'Startup Checklist Items',
      'Kickoff Responsibility Items',
      'Closeout Checklist Items',
      'JHA Steps',
      'JHA Attendees',
      'Buyout Bid Lines',
    ];

    const childLists = allWorkflowLists.filter(
      (list) => list.fields.some((f) => f.internalName === 'ParentRecord' || (f.type === 'Lookup' && f.lookupListTitle))
    );

    // All expected children must be present
    for (const expectedTitle of expectedChildren) {
      const found = childLists.find((l) => l.title === expectedTitle);
      expect(found, `${expectedTitle} must be a child list with a Lookup field`).toBeDefined();
    }

    // Verify count — only these 6 should have Lookup fields
    expect(childLists.length).toBe(expectedChildren.length);
  });

  it('TC-SCHEMA-09: Lookup fields specify lookupListTitle and lookupFieldName', () => {
    for (const list of allLists) {
      for (const field of list.fields) {
        if (field.type === 'Lookup') {
          expect(
            field.lookupListTitle,
            `${list.title}.${field.internalName} Lookup must have lookupListTitle`
          ).toBeTruthy();
          expect(
            field.lookupFieldName,
            `${list.title}.${field.internalName} Lookup must have lookupFieldName`
          ).toBeTruthy();
        }
      }
    }
  });

  it('TC-SCHEMA-11: core list fields have no defaultValue or indexed', () => {
    for (const list of HB_INTEL_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        expect(
          field.defaultValue,
          `Core list ${list.title}.${field.internalName} must not have defaultValue`
        ).toBeUndefined();
        expect(
          field.indexed,
          `Core list ${list.title}.${field.internalName} must not have indexed`
        ).toBeUndefined();
      }
    }
  });

  it('TC-SCHEMA-13: add-on definitions reference valid CORE_LIBRARIES names', () => {
    const coreLibNames = CORE_LIBRARIES.map((lib) => lib.name);

    for (const [key, addOn] of Object.entries(ADD_ON_DEFINITIONS)) {
      for (const fileEntry of addOn.templateFiles) {
        expect(
          coreLibNames,
          `Add-on "${key}" file "${fileEntry.fileName}" targets "${fileEntry.targetLibrary}" which is not in CORE_LIBRARIES`
        ).toContain(fileEntry.targetLibrary);
      }
    }
  });

  it('TC-PID-03: pid-contract.md exists on disk', () => {
    // Search for pid-contract in expected documentation locations
    const pidContractPath = path.resolve(__dirname, '../../../../docs/reference/data-model/pid-contract.md');
    expect(fs.existsSync(pidContractPath), 'pid-contract.md must exist at docs/reference/data-model/pid-contract.md').toBe(true);
  });

  it('TC-MCOEX-04: no migration code patterns in step3 or step4 source', () => {
    const step3Path = path.resolve(
      __dirname,
      '../functions/provisioningSaga/steps/step3-template-files.ts'
    );
    const step4Path = path.resolve(
      __dirname,
      '../functions/provisioningSaga/steps/step4-data-lists.ts'
    );

    const migrationPatterns = [
      /migrat/i,
      /data.?transform/i,
      /legacy.?convert/i,
      /schema.?upgrade/i,
      /v1.?to.?v2/i,
    ];

    for (const filePath of [step3Path, step4Path]) {
      const source = fs.readFileSync(filePath, 'utf-8');
      for (const pattern of migrationPatterns) {
        expect(
          pattern.test(source),
          `${path.basename(filePath)} must not contain migration pattern: ${pattern}`
        ).toBe(false);
      }
    }
  });

  it('TC-SCHEMA-MANIFEST: TEMPLATE_FILE_MANIFEST entries all target valid CORE_LIBRARIES', () => {
    const coreLibNames = CORE_LIBRARIES.map((lib) => lib.name);

    for (const entry of TEMPLATE_FILE_MANIFEST) {
      expect(
        coreLibNames,
        `Manifest entry "${entry.fileName}" targets "${entry.targetLibrary}" which is not in CORE_LIBRARIES`
      ).toContain(entry.targetLibrary);
    }
  });
});
