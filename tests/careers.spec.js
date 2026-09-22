import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';

const samplePdfPath = fileURLToPath(new URL('./fixtures/sample-cv.pdf', import.meta.url));

test.describe('Careers Page & Job Applications', () => {
  test('TC-CAREERS-04: Browse Careers and View Job Details', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'CAREERS' }).click();
    await expect(page.getByRole('link', { name: 'APPLY NOW' }).first()).toBeVisible({ timeout: 20000 });
    await page.getByRole('link', { name: 'APPLY NOW' }).first().click();
    await expect(page.getByText('Open Role')).toBeVisible();
  });

  test('TC-CAREERS-05: Submit Job Application with Resume PDF and Screening', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'CAREERS' }).click();
    await expect(page.getByRole('link', { name: 'APPLY NOW' }).first()).toBeVisible({ timeout: 20000 });
    await page.getByRole('link', { name: 'APPLY NOW' }).first().click();
    await expect(page.getByText('Open Role')).toBeVisible();

    await page.getByRole('textbox', { name: 'e.g. Saman Perera' }).fill('Jerry Perera');
    await page.getByRole('textbox', { name: 'you@email.com' }).fill('jerry@gmail.com');
    await page.getByRole('textbox', { name: '+94 71 234' }).fill('0778012596');

    // Upload Resume PDF
    await page.locator('input[type="file"]').setInputFiles(samplePdfPath);

    // Fill Screening questions
    const answerInputs = page.getByRole('textbox', { name: 'Type your answer here...' });
    const count = await answerInputs.count();
    for (let i = 0; i < count; i++) {
      await answerInputs.nth(i).fill('Extensive hands-on testing experience with automation frameworks and quality assurance.');
    }

    // Submit Application & Trigger Live Evaluation
    await page.getByRole('button', { name: 'Submit & Evaluate' }).click();

    // Verify Success Modal
    await expect(page.getByText('Application Submitted!')).toBeVisible({ timeout: 25000 });
  });

  test('TC-CAREERS-05a: Form Validation Blocks Incomplete Applications', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'CAREERS' }).click();
    await expect(page.getByRole('link', { name: 'APPLY NOW' }).first()).toBeVisible({ timeout: 20000 });
    await page.getByRole('link', { name: 'APPLY NOW' }).first().click();

    // Verify submit button is disabled before uploading CV
    await expect(page.getByRole('button', { name: 'Upload CV to continue' })).toBeDisabled();

    // Upload CV PDF
    await page.locator('input[type="file"]').setInputFiles(samplePdfPath);
    await expect(page.getByText('✓ Extracted successfully')).toBeVisible();

    // Attempt to submit without filling required Name and Email
    await page.getByRole('button', { name: 'Submit & Evaluate' }).click();

    // Form validation blocks submission; page remains on /apply and success modal does not appear
    await expect(page).toHaveURL(/.*apply/);
    await expect(page.getByText('Application Submitted!')).not.toBeVisible();
  });
});
