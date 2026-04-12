/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CART_CHECKOUT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
