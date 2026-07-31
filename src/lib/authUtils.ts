export function shouldUseDemoSession(error?: { code?: string; message?: string } | null): boolean {
  const code = (error?.code || '').toLowerCase();
  const message = (error?.message || '').toLowerCase();
  return code === 'auth/network-request-failed' || message.includes('network-request-failed') || message.includes('failed to fetch') || message.includes('err_name_not_resolved');
}

export function getDemoSessionEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('fleetDemoSession') === '1' || new URLSearchParams(window.location.search).get('demo') === '1';
}

export function setDemoSessionEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  if (enabled) {
    window.localStorage.setItem('fleetDemoSession', '1');
  } else {
    window.localStorage.removeItem('fleetDemoSession');
  }
}
