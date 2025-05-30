declare global {
  interface Window {
    google: typeof google | undefined;
  }
}

export {};
