import { test, expect } from '@playwright/test';

/**
 * US-AUTH-01 — Connexion administrateur agence
 * US-AUTH-03 — Connexion client avec identifiants existants
 */

test.describe('Page de connexion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('affiche le formulaire email + mot de passe', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], [type="submit"]')).toBeVisible();
  });

  test('affiche le lien "Oublié ?"', async ({ page }) => {
    await expect(page.getByRole('link', { name: /oublié/i })).toBeVisible();
  });

  test('affiche une erreur avec des identifiants invalides', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalide@test.com');
    await page.fill('input[type="password"]', 'mauvais-mot-de-passe');
    await page.click('[type="submit"]');

    await expect(page.getByText(/courriel ou mot de passe incorrect/i)).toBeVisible({ timeout: 8000 });
  });

  test('le bouton est désactivé pendant la soumission', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');

    const submitBtn = page.locator('[type="submit"]');
    await submitBtn.click();

    // Verify button shows loading state momentarily
    await expect(submitBtn).toBeDisabled({ timeout: 2000 });
  });

  test('redirige vers /login depuis la racine /', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('redirige vers /login si on accède à /clients sans session', async ({ page }) => {
    await page.goto('/clients');
    await expect(page).toHaveURL('/login');
  });
});
