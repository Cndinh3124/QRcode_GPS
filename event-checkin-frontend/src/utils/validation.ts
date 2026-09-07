export const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(
  email: string,
): boolean {
  return EMAIL_REGEX.test(email);
}

export function isEmpty(
  value?: string,
): boolean {
  return !value?.trim();
}