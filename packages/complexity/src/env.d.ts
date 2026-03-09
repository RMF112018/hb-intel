/**
 * Minimal ambient declaration for process.env.NODE_ENV.
 *
 * Complexity uses process.env.NODE_ENV for dev-only warnings.
 * Vite replaces these at build time via `define`.
 *
 * This declaration ensures consumers with restricted `types`
 * (e.g., apps with `types: ["vite/client"]`) can type-check
 * complexity source via path aliases without TS2591 errors.
 */
declare const process: {
  env: {
    NODE_ENV: string;
  };
};
