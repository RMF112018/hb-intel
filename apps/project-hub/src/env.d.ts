/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MSAL_CLIENT_ID: string;
  readonly VITE_MSAL_AUTHORITY: string;
  readonly VITE_PWA_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
