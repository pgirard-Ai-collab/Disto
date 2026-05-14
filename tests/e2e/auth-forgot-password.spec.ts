import { test, expect } from '@playwright/test';

/**
 * US-AUTH-06 — Réinitialisation de mot de passe
 */

test.describe('Page mot de passe oublié (/forgot-password)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('affiche le champ email et le bouton d\'envoi', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /envoyer le lien/i })).toBeVisible();
  });

  test('affiche un lien de retour vers /login', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /← retour/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/login');
  });

  test('affiche un message de confirmation après soumission', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@sartiga.co');
    await page.getByRole('button', { name: /envoyer le lien/i }).click();

    // Always shows success to prevent email enumeration
    await expect(page.getByText(/courriel envoyé/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('test@sartiga.co')).toBeVisible();
  });

  test('accessible depuis le lien "Oublié ?" de la page login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /oublié/i }).click();
    await expect(page).toHaveURL('/forgot-password');
  });
});

test.describe('Page mise à jour mot de passe (/update-password)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/update-password');
  });

  test('affiche un message d\'erreur sans session valide', async ({ page }) => {
    await expect(page.getByText(/lien invalide ou expiré/i)).toBeVisible({ timeout: 10000 });
  });

  test('les champs sont désactivés sans session valide', async ({ page }) => {
    // Wait for useEffect to resolve
    await expect(page.getByText(/lien invalide ou expiré/i)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]').first()).toBeDisabled();
  });

  test('affiche deux champs mot de passe et le bouton de mise à jour', async ({ page }) => {
    await expect(page.getByText(/lien invalide ou expiré/i)).toBeVisible({ timeout: 10000 });
    const inputs = page.locator('input[type="password"]');
    await expect(inputs).toHaveCount(2);
    await expect(page.getByRole('button', { name: /mettre à jour/i })).toBeVisible();
  });
});
