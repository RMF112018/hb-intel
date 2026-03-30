/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MSAL_CLIENT_ID: string;
  readonly VITE_MSAL_AUTHORITY: string;
  readonly VITE_FUNCTION_APP_URL: string;
  readonly VITE_BACKEND_MODE?: 'production' | 'ui-review';
  readonly VITE_ALLOW_BACKEND_MODE_SWITCH?: 'true' | 'false';
  readonly VITE_OPEX_MANAGER_UPN: string;
  readonly VITE_AZURE_TENANT_ID: string;
  readonly VITE_ADMIN_APP_URL?: string;
  /** P3-02: API audience URI for SPFx API token acquisition (e.g. `api://<client-id>`). */
  readonly VITE_API_AUDIENCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
