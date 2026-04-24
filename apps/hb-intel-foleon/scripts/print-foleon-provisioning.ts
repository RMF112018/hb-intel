#!/usr/bin/env tsx
/**
 * Foleon SharePoint provisioning dry-run.
 *
 * Emits the deterministic provisioning plan for all three Foleon MVP
 * lists as pretty-printed JSON. A tenant admin hands this to whoever
 * runs the PnP provisioning flow. This script never touches tenant
 * state.
 *
 * Usage: pnpm --filter @hbc/spfx-hb-intel-foleon provision:print
 */
import { buildFoleonProvisioningPlan } from '../src/schema/provisioningPlan.js';

const plan = buildFoleonProvisioningPlan();
process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
