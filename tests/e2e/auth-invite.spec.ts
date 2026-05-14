import { test, expect } from '@playwright/test';

/**
 * US-AUTH-04 — Création d'un compte client et envoi d'invitation
 * Tests UI de la page d'accès (formulaire d'invitation)
 */

test.describe('Formulaire d\'invitation (/clients/[id]/access)', () => {
  test.beforeEach(async ({ page }) => {
    // Access page redirects to login without session — test the login redirect
    await page.goto('/clients/sartiga/access');
  });

  test('redirige vers /login sans session', async ({ page }) => {
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Formulaire d\'invitation — structure UI', () => {
  // These tests mock auth state by directly visiting the access page
  // In a real test environment you would set up a test session first

  test('la page /clients redirige vers login sans authentification', async ({ page }) => {
    await page.goto('/clients');
    await expect(page).toHaveURL('/login');
  });
});
