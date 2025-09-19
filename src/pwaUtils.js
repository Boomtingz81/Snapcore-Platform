// src/pwaUtils.js
/**
 * Register the service worker at /sw.js (in public/)
 * Returns the registration or undefined if registration fails.
 */
export async function registerSW() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        const isInstalled = newWorker.state === 'installed';
        const hasController = Boolean(navigator.serviceWorker.controller);

        // If it's installed and there's already a controller, it's an update
        if (isInstalled && hasController) {
          // Broadcast a message so UI can show a snackbar/toast
          window.dispatchEvent(new CustomEvent('sw:update-available'));
        }
      });
    });

    // Optional: reload if a waiting worker says "skip waiting" was called
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // A new service worker has taken control
      // Reload to get the fresh assets
      window.location.reload();
    });

    return registration;
  } catch (err) {
    console.error('Service worker registration failed:', err);
    return undefined;
  }
}

/**
 * Ask for Notification permission safely.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Install prompt handler. Exposes a window event so your UI can show an "Install" button.
 * Usage:
 * window.addEventListener('pwa:install-available', (e) => { show button and call e.detail.promptInstall() })
 */
export function setupInstallPrompt() {
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const promptInstall = async () => {
      try {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice; // { outcome: 'accepted' | 'dismissed', platform: ... }
      } finally {
        deferredPrompt = null;
      }
    };

    window.dispatchEvent(new CustomEvent('pwa:install-available', {
      detail: { promptInstall }
    }));
  });
}

/**
 * Optional helper for your UI to trigger an update (when you’re showing a snackbar).
 */
export async function applySWUpdate() {
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg || !reg.waiting) return false;

  // Ask the waiting SW to skip waiting, then page reloads via controllerchange
  reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  return true;
}
