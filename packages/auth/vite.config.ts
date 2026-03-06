import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Phase 5.1 package foundation config for @hbc/auth.
 *
 * Ownership boundary:
 * - This package owns auth provider/adapters, session normalization, guards, hooks, and auth state.
 * - UI shell composition remains owned by @hbc/shell.
 *
 * Traceability:
 * - docs/architecture/plans/PH5.1-Auth-Shell-Plan.md §5.1
 * - docs/architecture/plans/PH5-Auth-Shell-Plan.md §5.1 (locked Option C)
 * - docs/architecture/blueprint/HB-Intel-Blueprint-V4.md §§1e, 1f, 2b, 2c, 2e
 */
export default defineConfig({
  plugins: [react()],
  server: {
    // Explicit HMR enables safe package-local iteration during adapter/store work.
    hmr: true,
  },
  define: {
    // Keep package-local debugging predictable in Vite-driven dev sessions.
    __HBC_AUTH_DEVTOOLS__: true,
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
