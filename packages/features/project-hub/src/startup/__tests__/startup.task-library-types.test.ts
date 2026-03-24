import { describe, expect, it } from 'vitest';

import {
  STARTUP_TASK_SECTION_CODES,
  STARTUP_TASK_CATEGORIES,
  STARTUP_TASK_SEVERITIES,
  STARTUP_TASK_GATING_IMPACTS,
  STARTUP_TASK_OWNER_ROLES,
  STARTUP_TASK_DUE_TRIGGERS,
  STARTUP_TASK_RESULTS,
  TASK_BLOCKER_TYPES,
  TASK_BLOCKER_STATUSES,
  STARTUP_TASK_EVIDENCE_TYPES,
  STARTUP_TASK_SECTIONS,
  STARTUP_SECTION_1_TEMPLATES,
  STARTUP_SECTION_2_TEMPLATES,
  STARTUP_SECTION_3_TEMPLATES,
  STARTUP_SECTION_4_TEMPLATES,
  STARTUP_ALL_TASK_TEMPLATES,
  STARTUP_TASK_DEPENDENCIES,
  STARTUP_TASK_SECTION_LABELS,
  STARTUP_TASK_CATEGORY_LABELS,
  STARTUP_TASK_SEVERITY_LABELS,
  STARTUP_TASK_GATING_IMPACT_LABELS,
  STARTUP_TASK_OWNER_ROLE_LABELS,
  STARTUP_TASK_DUE_TRIGGER_LABELS,
  TASK_BLOCKER_TYPE_LABELS,
  STARTUP_TASK_EVIDENCE_TYPE_LABELS,
  IMMUTABLE_TEMPLATE_FIELDS,
  STAGE2_ACTIVITY_EVENTS,
  STAGE2_ACTIVITY_EVENT_DEFINITIONS,
  STAGE2_HEALTH_METRICS,
  STAGE2_HEALTH_METRIC_DEFINITIONS,
  STAGE2_WORK_QUEUE_ITEMS,
  STAGE2_WORK_QUEUE_ITEM_DEFINITIONS,
} from '../../index.js';

describe('P3-E11-T10 Stage 2 Startup task library contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('StartupTaskSectionCode', () => {
    it('has exactly 4 sections per T03 §2', () => {
      expect(STARTUP_TASK_SECTION_CODES).toHaveLength(4);
    });
  });

  describe('StartupTaskCategory', () => {
    it('has exactly 12 categories per T03 §3', () => {
      expect(STARTUP_TASK_CATEGORIES).toHaveLength(12);
    });
  });

  describe('StartupTaskSeverity', () => {
    it('has exactly 3 severity levels per T03 §4', () => {
      expect(STARTUP_TASK_SEVERITIES).toHaveLength(3);
    });
  });

  describe('StartupTaskGatingImpact', () => {
    it('has exactly 3 gating impacts per T03 §4', () => {
      expect(STARTUP_TASK_GATING_IMPACTS).toHaveLength(3);
    });
  });

  describe('StartupTaskOwnerRole', () => {
    it('has exactly 6 owner roles per T03 §4', () => {
      expect(STARTUP_TASK_OWNER_ROLES).toHaveLength(6);
    });
  });

  describe('StartupTaskDueTrigger', () => {
    it('has exactly 5 due triggers per T03 §6', () => {
      expect(STARTUP_TASK_DUE_TRIGGERS).toHaveLength(5);
    });
  });

  describe('StartupTaskResult', () => {
    it('has exactly 3 result values per T03 §2', () => {
      expect(STARTUP_TASK_RESULTS).toHaveLength(3);
    });
  });

  describe('TaskBlockerType', () => {
    it('has exactly 8 blocker types per T03 §8', () => {
      expect(TASK_BLOCKER_TYPES).toHaveLength(8);
    });
  });

  describe('TaskBlockerStatus', () => {
    it('has exactly 3 blocker statuses per T03 §8', () => {
      expect(TASK_BLOCKER_STATUSES).toHaveLength(3);
    });
  });

  describe('StartupTaskEvidenceType', () => {
    it('has exactly 9 evidence types per T03 §7', () => {
      expect(STARTUP_TASK_EVIDENCE_TYPES).toHaveLength(9);
    });
  });

  // -- Section definitions ---------------------------------------------------

  describe('Section definitions', () => {
    it('has exactly 4 section definitions', () => {
      expect(STARTUP_TASK_SECTIONS).toHaveLength(4);
    });

    it('Section 1 has 4 tasks', () => {
      const s1 = STARTUP_TASK_SECTIONS.find((s) => s.sectionCode === 'REVIEW_OWNER_CONTRACT');
      expect(s1?.taskCount).toBe(4);
    });

    it('Section 2 has 33 tasks', () => {
      const s2 = STARTUP_TASK_SECTIONS.find((s) => s.sectionCode === 'JOB_STARTUP');
      expect(s2?.taskCount).toBe(33);
    });

    it('Section 3 has 6 tasks', () => {
      const s3 = STARTUP_TASK_SECTIONS.find((s) => s.sectionCode === 'ORDER_SERVICES');
      expect(s3?.taskCount).toBe(6);
    });

    it('Section 4 has 12 tasks', () => {
      const s4 = STARTUP_TASK_SECTIONS.find((s) => s.sectionCode === 'PERMIT_POSTING');
      expect(s4?.taskCount).toBe(12);
    });

    it('total across sections is 55', () => {
      const total = STARTUP_TASK_SECTIONS.reduce((sum, s) => sum + s.taskCount, 0);
      expect(total).toBe(55);
    });
  });

  // -- Template catalog ------------------------------------------------------

  describe('Template catalog', () => {
    it('Section 1 has exactly 4 templates', () => {
      expect(STARTUP_SECTION_1_TEMPLATES).toHaveLength(4);
    });

    it('Section 2 has exactly 33 templates', () => {
      expect(STARTUP_SECTION_2_TEMPLATES).toHaveLength(33);
    });

    it('Section 3 has exactly 6 templates', () => {
      expect(STARTUP_SECTION_3_TEMPLATES).toHaveLength(6);
    });

    it('Section 4 has exactly 12 templates', () => {
      expect(STARTUP_SECTION_4_TEMPLATES).toHaveLength(12);
    });

    it('combined catalog has exactly 55 templates', () => {
      expect(STARTUP_ALL_TASK_TEMPLATES).toHaveLength(55);
    });

    it('every template has required fields', () => {
      for (const tmpl of STARTUP_ALL_TASK_TEMPLATES) {
        expect(tmpl.taskNumber).toBeTruthy();
        expect(tmpl.title).toBeTruthy();
        expect(tmpl.sectionCode).toBeTruthy();
        expect(tmpl.category).toBeTruthy();
        expect(tmpl.severity).toBeTruthy();
        expect(tmpl.gatingImpact).toBeTruthy();
        expect(tmpl.ownerRoleCode).toBeTruthy();
        expect(tmpl.dueTrigger).toBeTruthy();
        expect(typeof tmpl.activeDuringStabilization).toBe('boolean');
      }
    });

    it('all Section 4 tasks have activeDuringStabilization = true', () => {
      for (const tmpl of STARTUP_SECTION_4_TEMPLATES) {
        expect(tmpl.activeDuringStabilization).toBe(true);
      }
    });

    it('all Section 4 tasks have category = PERMIT_POSTING', () => {
      for (const tmpl of STARTUP_SECTION_4_TEMPLATES) {
        expect(tmpl.category).toBe('PERMIT_POSTING');
      }
    });

    it('all Section 4 tasks have dueTrigger = DAYS_BEFORE_MOBILIZATION with offset 0', () => {
      for (const tmpl of STARTUP_SECTION_4_TEMPLATES) {
        expect(tmpl.dueTrigger).toBe('DAYS_BEFORE_MOBILIZATION');
        expect(tmpl.dueOffsetDays).toBe(0);
      }
    });

    it('all Section 1 tasks have sectionCode = REVIEW_OWNER_CONTRACT', () => {
      for (const tmpl of STARTUP_SECTION_1_TEMPLATES) {
        expect(tmpl.sectionCode).toBe('REVIEW_OWNER_CONTRACT');
      }
    });

    it('task numbers are unique across the catalog', () => {
      const numbers = STARTUP_ALL_TASK_TEMPLATES.map((t) => t.taskNumber);
      expect(new Set(numbers).size).toBe(55);
    });

    it('no circular dependencies exist in the catalog', () => {
      const depMap = new Map<string, readonly string[]>();
      for (const tmpl of STARTUP_ALL_TASK_TEMPLATES) {
        if (tmpl.dependsOnTaskNumbers.length > 0) {
          depMap.set(tmpl.taskNumber, tmpl.dependsOnTaskNumbers);
        }
      }
      // Simple cycle detection via DFS
      const visited = new Set<string>();
      const inStack = new Set<string>();
      let hasCycle = false;
      const visit = (node: string): void => {
        if (inStack.has(node)) { hasCycle = true; return; }
        if (visited.has(node)) return;
        visited.add(node);
        inStack.add(node);
        for (const dep of depMap.get(node) ?? []) visit(dep);
        inStack.delete(node);
      };
      for (const node of depMap.keys()) visit(node);
      expect(hasCycle).toBe(false);
    });
  });

  // -- Dependencies ----------------------------------------------------------

  describe('Key dependency chains', () => {
    it('has exactly 5 documented dependency chains per T03 §5.2', () => {
      expect(STARTUP_TASK_DEPENDENCIES).toHaveLength(5);
    });

    it('each chain has taskNumber, dependsOn, and rationale', () => {
      for (const dep of STARTUP_TASK_DEPENDENCIES) {
        expect(dep.taskNumber).toBeTruthy();
        expect(dep.dependsOn.length).toBeGreaterThan(0);
        expect(dep.rationale).toBeTruthy();
      }
    });
  });

  // -- Immutable fields ------------------------------------------------------

  describe('Immutable template fields', () => {
    it('has exactly 8 immutable fields per T03 §2', () => {
      expect(IMMUTABLE_TEMPLATE_FIELDS).toHaveLength(8);
    });

    it('includes taskNumber and title', () => {
      expect(IMMUTABLE_TEMPLATE_FIELDS).toContain('taskNumber');
      expect(IMMUTABLE_TEMPLATE_FIELDS).toContain('title');
    });
  });

  // -- Stage 2 spine publication ---------------------------------------------

  describe('Stage 2 Activity Spine events', () => {
    it('has exactly 4 events per T10 §2 Stage 2', () => {
      expect(STAGE2_ACTIVITY_EVENTS).toHaveLength(4);
    });

    it('has 4 event definitions', () => {
      expect(STAGE2_ACTIVITY_EVENT_DEFINITIONS).toHaveLength(4);
    });
  });

  describe('Stage 2 Health Spine metrics', () => {
    it('has exactly 2 metrics per T10 §2 Stage 2', () => {
      expect(STAGE2_HEALTH_METRICS).toHaveLength(2);
    });

    it('has 2 metric definitions', () => {
      expect(STAGE2_HEALTH_METRIC_DEFINITIONS).toHaveLength(2);
    });
  });

  describe('Stage 2 Work Queue items', () => {
    it('has exactly 2 items per T10 §2 Stage 2', () => {
      expect(STAGE2_WORK_QUEUE_ITEMS).toHaveLength(2);
    });

    it('has 2 item definitions', () => {
      expect(STAGE2_WORK_QUEUE_ITEM_DEFINITIONS).toHaveLength(2);
    });
  });

  // -- Label maps ------------------------------------------------------------

  describe('Label maps', () => {
    it('labels all 4 sections', () => {
      expect(Object.keys(STARTUP_TASK_SECTION_LABELS)).toHaveLength(4);
    });

    it('labels all 12 categories', () => {
      expect(Object.keys(STARTUP_TASK_CATEGORY_LABELS)).toHaveLength(12);
    });

    it('labels all 3 severities', () => {
      expect(Object.keys(STARTUP_TASK_SEVERITY_LABELS)).toHaveLength(3);
    });

    it('labels all 3 gating impacts', () => {
      expect(Object.keys(STARTUP_TASK_GATING_IMPACT_LABELS)).toHaveLength(3);
    });

    it('labels all 6 owner roles', () => {
      expect(Object.keys(STARTUP_TASK_OWNER_ROLE_LABELS)).toHaveLength(6);
    });

    it('labels all 5 due triggers', () => {
      expect(Object.keys(STARTUP_TASK_DUE_TRIGGER_LABELS)).toHaveLength(5);
    });

    it('labels all 8 blocker types', () => {
      expect(Object.keys(TASK_BLOCKER_TYPE_LABELS)).toHaveLength(8);
    });

    it('labels all 9 evidence types', () => {
      expect(Object.keys(STARTUP_TASK_EVIDENCE_TYPE_LABELS)).toHaveLength(9);
    });
  });
});
