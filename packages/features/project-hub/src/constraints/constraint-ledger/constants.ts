/**
 * P3-E6-T02 Constraint Ledger constants.
 * Contract-locked values for enumerations, transition rules, and governed defaults.
 */

import type { ConstraintCategory, ConstraintPriority, ConstraintStatus } from './enums.js';

// ── Module Scope ────────────────────────────────────────────────────

export const CONSTRAINT_LEDGER_SCOPE = 'constraints/constraint-ledger' as const;

// ── Status Enumerations (§2.3) ──────────────────────────────────────

export const CONSTRAINT_STATUSES = [
  'Identified',
  'UnderAction',
  'Pending',
  'Resolved',
  'Void',
  'Cancelled',
  'Superseded',
] as const satisfies ReadonlyArray<ConstraintStatus>;

export const TERMINAL_CONSTRAINT_STATUSES = [
  'Resolved',
  'Void',
  'Cancelled',
  'Superseded',
] as const satisfies ReadonlyArray<ConstraintStatus>;

// ── Category Enumeration (§2.4) ────────────────────────────────────

export const CONSTRAINT_CATEGORIES = [
  'DESIGN',
  'PERMITS',
  'PROCUREMENT',
  'LABOR',
  'WEATHER',
  'SAFETY',
  'QUALITY',
  'SCHEDULE',
  'COST',
  'ENVIRONMENTAL',
  'EQUIPMENT',
  'COMMUNICATION',
  'SITE_ACCESS',
  'UTILITIES',
  'GEOTECHNICAL',
  'LEGAL',
  'TECHNOLOGY',
  'SECURITY',
  'SUBCONTRACTOR',
  'INSPECTIONS',
  'LOGISTICS',
  'STAKEHOLDER',
  'OWNER_REQUIREMENTS',
  'CHANGE_MANAGEMENT',
  'PUBLIC_WORKS',
  'OTHER',
] as const satisfies ReadonlyArray<ConstraintCategory>;

// ── Priority Levels (§2.5) ─────────────────────────────────────────

export const CONSTRAINT_PRIORITY_LEVELS = [1, 2, 3, 4] as const satisfies ReadonlyArray<ConstraintPriority>;

// ── State Transition Map (§2.3) ─────────────────────────────────────

export const VALID_CONSTRAINT_TRANSITIONS: Readonly<Record<ConstraintStatus, readonly ConstraintStatus[]>> = {
  Identified: ['UnderAction', 'Pending', 'Void'],
  UnderAction: ['Pending', 'Resolved', 'Void'],
  Pending: ['UnderAction', 'Resolved', 'Void'],
  Resolved: [],
  Void: [],
  Cancelled: [],
  Superseded: [],
};

// ── Immutable Fields (C-01) ─────────────────────────────────────────

export const CONSTRAINT_IMMUTABLE_FIELDS = [
  'constraintId',
  'projectId',
  'constraintNumber',
  'category',
  'dateIdentified',
  'identifiedBy',
  'parentRiskId',
  'createdAt',
  'createdBy',
] as const;

// ── Label Maps ──────────────────────────────────────────────────────

export const CONSTRAINT_PRIORITY_LABELS: Readonly<Record<ConstraintPriority, string>> = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
};

export const CONSTRAINT_CATEGORY_LABELS: Readonly<Record<ConstraintCategory, string>> = {
  DESIGN: 'Design and engineering',
  PERMITS: 'Permits and regulatory approvals',
  PROCUREMENT: 'Materials and equipment procurement',
  LABOR: 'Labor and workforce availability',
  WEATHER: 'Weather and environmental',
  SAFETY: 'Safety and health',
  QUALITY: 'Quality and defect management',
  SCHEDULE: 'Schedule and sequencing',
  COST: 'Budget and cost',
  ENVIRONMENTAL: 'Environmental compliance and remediation',
  EQUIPMENT: 'Equipment availability and performance',
  COMMUNICATION: 'Communication and coordination',
  SITE_ACCESS: 'Site access and logistics',
  UTILITIES: 'Utility conflicts and relocations',
  GEOTECHNICAL: 'Geotechnical and soil conditions',
  LEGAL: 'Legal and contractual',
  TECHNOLOGY: 'Technology and systems',
  SECURITY: 'Security and access',
  SUBCONTRACTOR: 'Subcontractor performance',
  INSPECTIONS: 'Inspection and testing',
  LOGISTICS: 'Material delivery and logistics',
  STAKEHOLDER: 'Stakeholder coordination and approvals',
  OWNER_REQUIREMENTS: 'Owner-specified requirements',
  CHANGE_MANAGEMENT: 'Change control and scope',
  PUBLIC_WORKS: 'Public works and infrastructure',
  OTHER: 'Unclassified constraint',
};
