/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MSAL_CLIENT_ID: string;
  readonly VITE_MSAL_AUTHORITY: string;
  readonly VITE_FUNCTION_APP_URL: string;
  readonly VITE_OPEX_MANAGER_UPN: string;
  readonly VITE_AZURE_TENANT_ID: string;
  readonly VITE_ADMIN_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
