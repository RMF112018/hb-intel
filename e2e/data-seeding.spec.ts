import { test } from '@playwright/test';

// SF09-T09 — Playwright E2E stubs for @hbc/data-seeding
// TODO: implement when data-seeding dev-harness routes are available

test.skip('E2E-01: Full Excel import lifecycle — upload → map → preview → import → complete', async ({ page }) => {
  // Navigate to dev-harness data-import route for BD leads
  // Upload bd-leads-sample.xlsx
  // Verify file loaded (ready state with row count)
  // Verify mapper renders with auto-mapped fields
  // Confirm mapping
  // Verify preview shows rows with summary bar
  // Confirm import
  // Wait for progress bar to show Import Complete
});

test.skip('E2E-02: Partial import — valid rows imported, error rows in downloadable report (D-04)', async ({ page }) => {
  // Navigate to dev-harness data-import route
  // Upload file with intentional validation errors
  // Confirm mapping
  // Verify preview shows error count in summary bar
  // Verify confirm button shows "Import N, skip M"
  // Confirm import
  // Wait for partial status
  // Verify error report download link visible
});

test.skip('E2E-03: Procore JSON export import for Project Hub (D-08)', async ({ page }) => {
  // Navigate to dev-harness data-import for project-record
  // Upload procore-export-sample.json
  // Verify Procore Export format detected
  // Confirm mapping and preview
  // Wait for Import Complete
});

test.skip('E2E-04: Essential complexity — simplified flow, no Mapper or Preview table (D-09)', async ({ page }) => {
  // Navigate to dev-harness settings, set complexity to Essential
  // Navigate to data-import route
  // Upload file
  // Verify mapper NOT rendered
  // Verify simplified summary (not full preview table)
  // Confirm import
  // Wait for Import Complete
});

test.skip('E2E-05: Large file (>10MB) — routes through server-side parse (D-01)', async ({ page }) => {
  // Navigate to dev-harness data-import route
  // Upload file >10MB
  // Verify uploading state shown
  // Wait for ready state (server-side parse complete)
  // Proceed with normal flow
});
