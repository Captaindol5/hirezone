import { test, expect } from '@playwright/test';

test.describe('Kanban Board & Custom Pipelines', () => {
  test('TC-KANBAN-06: HR User Views Pipeline Stages on Kanban Board', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('naveen@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Naveen@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();

    // Verify jobs load on HR dashboard
    await expect(page.getByText('Quality Assurance Engineer')).toBeVisible({ timeout: 20000 });

    // Open Kanban board
    await page.getByRole('button', { name: 'Kanban board' }).first().click();

    // Verify pipeline stages are visible
    await expect(page.getByText(/Pipeline|stages|Initial Interview/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Kanban board' })).toBeVisible();
  });

  test('TC-KANBAN-07: Candidate Population and Detail Inspection on Kanban', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('naveen@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Naveen@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();

    // Open Kanban board
    await expect(page.getByText('Quality Assurance Engineer')).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: 'Kanban board' }).first().click();

    // Verify candidate card is populated in pipeline stage
    await expect(page.getByText(/Navin/i).first()).toBeVisible({ timeout: 15000 });

    // Click View on the candidate card
    await page.getByRole('button', { name: 'View', exact: true }).first().click();

    // Verify candidate detail modal opens with profile info
    await expect(page.getByText(/Navin Manathunga/i).first()).toBeVisible();
    await expect(page.getByText(/Stage:/i).first()).toBeVisible();
  });

  test('TC-KANBAN-07a: Enforce Mandatory Feedback Stage-Gate on Candidate Advancement', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('naveen@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Naveen@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();

    // Open Kanban board
    await expect(page.getByText('Quality Assurance Engineer')).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: 'Kanban board' }).first().click();

    // Verify candidate shows "Feedback: Missing" and "Pending" status on Kanban card
    await expect(page.getByText(/Feedback: Missing/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Pending/i).first()).toBeVisible();

    // Open candidate modal for the candidate with missing feedback
    const pendingCard = page.locator('div').filter({ hasText: 'Feedback: Missing' }).last();
    await pendingCard.getByRole('button', { name: 'View' }).click();

    // Verify stage-gate guard: "Feedback and score are pending" warning is displayed
    await expect(page.getByText(/Feedback and score are pending for this stage/i)).toBeVisible();

    // Verify that the "Advance" button is blocked / hidden due to mandatory stage-gate
    await expect(page.getByRole('button', { name: 'Advance' })).not.toBeVisible();
  });
});
