export function formatDate(
  value: string | Date,
): string {
  return new Date(value).toLocaleString();
}

export function formatDateOnly(
  value: string | Date,
): string {
  return new Date(value).toLocaleDateString();
}

export function formatTime(
  value: string | Date,
): string {
  return new Date(value).toLocaleTimeString();
}

export function isExpired(
  value: string | Date,
): boolean {
  return new Date(value) < new Date();
}