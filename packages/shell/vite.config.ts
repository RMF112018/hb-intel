import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Phase 5.1 package foundation config for @hbc/shell.
 *
 * Ownership boundary:
 * - This package owns shell composition, shell status derivation, navigation shell, layouts,
 *   and degraded/recovery shell states.
 * - Auth provider/adapters and permission truth remain owned by @hbc/auth.
 *
 * Traceability:
 * - docs/architecture/plans/PH5.1-Auth-Shell-Plan.md §5.1
 * - docs/architecture/plans/PH5-Auth-Shell-Plan.md §5.1 (locked Option C)
 * - docs/architecture/blueprint/HB-Intel-Blueprint-V4.md §§1e, 1f, 2b, 2c, 2e
 */
export default defineConfig({
  plugins: [react()],
  server: {
    // Shell UX iteration requires reliable HMR for layout and navigation surfaces.
    hmr: true,
  },
  define: {
    // Enables explicit shell-side debug instrumentation during local development.
    __HBC_SHELL_DEVTOOLS__: true,
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
