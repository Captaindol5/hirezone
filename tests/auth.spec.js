import { test, expect } from '@playwright/test';

test.describe('Authentication & Role-Based Routing', () => {
  test('TC-AUTH-01: Successful HR Login and Dashboard Access', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('naveen@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).click();
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Naveen@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();
    await expect(page.getByRole('heading', { name: 'HR / Hiring Manager' })).toBeVisible();
  });

  test('TC-AUTH-02: Successful Interviewer Login and Dashboard Access', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('abhi@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).click();
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Abhi@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();
    await expect(page.getByRole('heading', { name: 'Interviewer Portal' })).toBeVisible();
  });

  test('TC-AUTH-03: Successful Manager Login and Dashboard Access', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('sarah@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).click();
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Sarah@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();
    await expect(page.getByRole('heading', { name: 'Executive Manager' })).toBeVisible();
  });

  test('TC-AUTH-03a: Invalid Credentials Error Handling', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('test123@gmail.com');
    await page.getByRole('textbox', { name: 'Enter password' }).click();
    await page.getByRole('textbox', { name: 'Enter password' }).fill('test123');
    await page.getByRole('textbox', { name: 'Enter password' }).press('Enter');
    await expect(page.getByText('Oops!Unable to sign in.')).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
  });

  test('TC-AUTH-03b: Unauthenticated Access Redirection', async ({ page }) => {
    await page.goto('/portal/hr');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText('SecureWelcome back.Sign in to')).toBeVisible();
  });

  test('TC-AUTH-03c: Wrong Role Access Control (RBAC Guard)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('nubaidh@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).click();
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Nubaidh@123');
    await page.getByRole('textbox', { name: 'Enter password' }).press('Enter');
    await page.goto('/portal/analytics');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText('SecureWelcome back.Sign in to')).toBeVisible();
  });
});
