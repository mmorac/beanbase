export const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyCkVU8OIaB6wmSlaT8GdVOWwwVI9E1nTPw';

const GOOGLE_MAPS_SCRIPT_ID = 'beanbase-google-maps';

type AuthListener = () => void;

const authListeners = new Set<AuthListener>();
let mapsLoader: Promise<void> | null = null;
let authFailed = false;

const markAuthFailed = () => {
  authFailed = true;
  authListeners.forEach(listener => listener());
};

if (typeof window !== 'undefined') {
  window.gm_authFailure = markAuthFailed;
}

export const didGoogleMapsAuthFail = () => authFailed;

export const onGoogleMapsAuthFailure = (listener: AuthListener) => {
  authListeners.add(listener);
  if (authFailed) {
    listener();
  }

  return () => {
    authListeners.delete(listener);
  };
};

const isGoogleMapsReady = () => Boolean(window.google?.maps?.Map);

export const loadGoogleMaps = () => {
  if (authFailed) {
    return Promise.reject(new Error('Google Maps authorization failed'));
  }

  if (isGoogleMapsReady()) {
    return Promise.resolve();
  }

  if (mapsLoader) {
    return mapsLoader;
  }

  mapsLoader = new Promise((resolve, reject) => {
    const fail = (message: string) => {
      mapsLoader = null;
      reject(new Error(message));
    };

    const finishIfReady = () => {
      if (authFailed) {
        fail('Google Maps authorization failed');
        return true;
      }

      if (isGoogleMapsReady()) {
        resolve();
        return true;
      }

      return false;
    };

    if (finishIfReady()) {
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (finishIfReady()) {
        window.clearInterval(interval);
        return;
      }

      if (Date.now() - startedAt > 8000) {
        window.clearInterval(interval);
        fail('Google Maps timed out');
      }
    }, 50);

    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener(
        'error',
        () => {
          window.clearInterval(interval);
          fail('Google Maps failed to load');
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      window.clearInterval(interval);
      fail('Google Maps failed to load');
    };
    document.body.appendChild(script);
  });

  return mapsLoader;
};
