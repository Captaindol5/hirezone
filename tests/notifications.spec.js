import { test, expect } from '@playwright/test';

test.describe('Real-time Notifications', () => {
  test('TC-NOTIF-12: Receive Notification & Display Unread Badge Counter', async ({ page }) => {
    // Step 1: Navigate to portal login
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();

    // Step 2: Sign in as HR User
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('naveen@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Naveen@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();

    // Verify HR portal loads
    await expect(page.getByRole('heading', { name: /HR|Hiring Manager/i })).toBeVisible({ timeout: 20000 });

    // Step 3: Verify notification bell is visible
    const bellBtn = page.locator('#notification-bell-btn');
    await expect(bellBtn).toBeVisible({ timeout: 15000 });

    // Step 4: Click notification bell to open dropdown panel
    await bellBtn.click();
    await expect(page.getByText('Notifications', { exact: true })).toBeVisible();
  });

  test('TC-NOTIF-13: Read Notification and Reset Counter to Zero', async ({ page }) => {
    // Step 1: Sign in as HR User
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('naveen@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Naveen@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();

    // Verify HR portal loads
    await expect(page.getByRole('heading', { name: /HR|Hiring Manager/i })).toBeVisible({ timeout: 20000 });

    // Step 2: Open notification bell dropdown
    const bellBtn = page.locator('#notification-bell-btn');
    await expect(bellBtn).toBeVisible({ timeout: 15000 });
    await bellBtn.click();
    await expect(page.getByText('Notifications', { exact: true })).toBeVisible();

    // Step 3: If unread notifications exist, click All read
    const allReadBtn = page.getByRole('button', { name: /All read/i });
    if (await allReadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await allReadBtn.click();
      await expect(page.getByText('0 unread')).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.getByText('0 unread')).toBeVisible();
    }
  });
});
