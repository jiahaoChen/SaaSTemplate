/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GA4_MEASUREMENT_ID: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
