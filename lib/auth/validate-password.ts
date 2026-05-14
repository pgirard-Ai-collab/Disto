export type PasswordValidationError =
  | 'mismatch'
  | 'too_short'
  | null;

export function validatePassword(password: string, confirm: string): PasswordValidationError {
  if (password !== confirm) return 'mismatch';
  if (password.length < 8) return 'too_short';
  return null;
}

export const PASSWORD_ERRORS: Record<NonNullable<PasswordValidationError>, string> = {
  mismatch: 'Les mots de passe ne correspondent pas.',
  too_short: 'Le mot de passe doit contenir au moins 8 caractères.',
};
