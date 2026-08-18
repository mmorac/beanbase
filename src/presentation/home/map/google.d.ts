declare global {
  interface Window {
    google: typeof google | undefined;
    gm_authFailure?: () => void;
  }
}

export {};
