export type PasswordValidationError =
  | 'mismatch'
  | 'too_short'
  | null;

export function validatePassword(password: string, confirm: string): PasswordValidationError {
  if (password !== confirm) return 'mismatch';
  if (password.length < 8) return 'too_short';
  return null;
}
