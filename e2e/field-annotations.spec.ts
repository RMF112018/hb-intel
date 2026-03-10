import { test } from '@playwright/test';

// SF07-T08 — Playwright E2E stubs for @hbc/field-annotations
// TODO: implement when field-annotations dev-harness routes are available

test.skip('E2E-01: Complexity mode gating — Essential hides marker and summary (D-05)', async ({ page }) => {
  // Navigate to dev-harness field-annotations route
  // Set complexity to Essential
  // Verify HbcAnnotationMarker not visible
  // Verify HbcAnnotationSummary not visible
});

test.skip('E2E-02: Standard mode — marker shows colored dot, summary shows counts (D-05)', async ({ page }) => {
  // Navigate to dev-harness with Standard complexity
  // Verify marker renders with correct color dot
  // Verify summary shows open annotation counts
  // Verify "Across N fields" text appears
});

test.skip('E2E-03: Expert mode — marker shows count badge, summary shows per-field list (D-05)', async ({ page }) => {
  // Navigate to dev-harness with Expert complexity
  // Verify marker shows numeric count badge
  // Verify summary shows per-field breakdown with author names
});

test.skip('E2E-04: BIC blocking on clarification-request creation (D-03)', async ({ page }) => {
  // Create a clarification-request annotation
  // Verify BIC advancement is blocked
  // Verify blocking indicator shows on BIC-next-move component
});

test.skip('E2E-05: BIC unblocking on annotation resolution (D-03)', async ({ page }) => {
  // Resolve the blocking clarification-request
  // Verify BIC advancement is unblocked
});

test.skip('E2E-06: Resolved annotations toggle in thread (D-07)', async ({ page }) => {
  // Open annotation thread with resolved annotations
  // Verify resolved section is collapsed by default
  // Click "Show resolved" toggle
  // Verify resolved annotations become visible with resolution details
});

test.skip('E2E-07: Assignment and notification on annotation creation (D-08)', async ({ page }) => {
  // Enable allowAssignment config
  // Create annotation with assigned user
  // Verify assignee appears in thread
  // Verify notification sent (via notification-intelligence mock)
});

test.skip('E2E-08: Field focus callback from summary (D-09)', async ({ page }) => {
  // Expert mode summary with multiple fields
  // Click a field item in summary
  // Verify onFieldFocus callback scrolls to the correct field
});

test.skip('E2E-09: SPFx context — marker renders, summary hidden (D-06)', async ({ page }) => {
  // Simulate SPFx context (app-shell Popover)
  // Verify marker renders correctly
  // Verify summary is not rendered (consumer responsibility)
  // Verify thread opens in Popover
});
