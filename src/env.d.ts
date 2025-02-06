interface ImportMetaEnv {
  readonly VITE_FIREBASE_PRIVATE_KEY_ID: string;
  readonly VITE_FIREBASE_PRIVATE_KEY: string;
  readonly VITE_PUBLIC_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_CLIENT_EMAIL: string;
  readonly VITE_FIREBASE_CLIENT_ID: string;
  readonly VITE_FIREBASE_AUTH_URI: string;
  readonly VITE_FIREBASE_TOKEN_URI: string;
  readonly VITE_FIREBASE_AUTH_CERT_URL: string;
  readonly VITE_FIREBASE_CLIENT_CERT_URL: string;
  readonly VITE_API_KEY: string;
  readonly VITE_AUTH_DOMAIN: string;
  readonly VITE_DATABASE_URL: string;
  readonly VITE_PROJECT_ID: string;
  readonly VITE_STORAGE_BUCKET: string;
  readonly VITE_MESSAGING_SENDER_ID: string;
  readonly VITE_APP_ID: string;
  readonly VITE_MEASUREMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
