export function getDeviceInfo(): string {
  return navigator.userAgent;
}

export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(
    navigator.userAgent,
  );
}

export function getLanguage(): string {
  return navigator.language;
}