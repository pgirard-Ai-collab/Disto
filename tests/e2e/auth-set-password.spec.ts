import { test, expect } from '@playwright/test';

/**
 * US-AUTH-02 — Connexion client via lien d'invitation (page set-password)
 */

test.describe('Page définir mot de passe (/set-password)', () => {
  test('affiche un message d\'erreur si le lien est invalide (pas de session)', async ({ page }) => {
    await page.goto('/set-password');

    // useEffect calls getSession() — wait for the error to appear
    await expect(page.getByText(/lien invalide ou expiré/i)).toBeVisible({ timeout: 10000 });
  });

  test('les champs sont désactivés sans session valide', async ({ page }) => {
    await page.goto('/set-password');

    // Wait for useEffect to resolve session check
    await expect(page.getByText(/lien invalide ou expiré/i)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]').first()).toBeDisabled();
  });

  test('affiche les deux champs mot de passe et le bouton d\'activation', async ({ page }) => {
    await page.goto('/set-password');

    // Wait for page to fully load (error state confirms useEffect ran)
    await expect(page.getByText(/lien invalide ou expiré/i)).toBeVisible({ timeout: 10000 });

    const inputs = page.locator('input[type="password"]');
    await expect(inputs).toHaveCount(2);
    await expect(page.getByRole('button', { name: /activer/i })).toBeVisible();
  });
});
