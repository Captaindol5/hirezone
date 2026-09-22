import { test, expect } from '@playwright/test';

test.describe('Feedback Portal & Scorecards', () => {
  test('TC-FEEDBACK-08: Interviewer Accesses Assigned Candidate Queue and Scorecard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('nubaidh@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Nubaidh@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();

    // Verify Interviewer queue is displayed
    await expect(page.getByText('Queue')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Candidates for review/i)).toBeVisible();

    // Select first available candidate from the queue dynamically
    const candidateCard = page.locator('aside button').first();
    await expect(candidateCard).toBeVisible({ timeout: 15000 });
    await candidateCard.click();

    // Verify candidate profile details and scorecard appear
    await expect(page.getByText('Candidate profile')).toBeVisible();
    await expect(page.getByText(/Stage:/i).first()).toBeVisible();
    await expect(page.getByText(/Profile/i).first()).toBeVisible();
    await expect(page.getByText(/Structured evaluation/i)).toBeVisible();
  });

  test('TC-FEEDBACK-09: Interviewer Submits Evaluation Score and Comments', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('nubaidh@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Nubaidh@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();

    // Select candidate from the review queue dynamically
    await expect(page.getByText('Queue')).toBeVisible({ timeout: 20000 });
    const candidateCard = page.locator('aside button').first();
    await expect(candidateCard).toBeVisible({ timeout: 15000 });
    await candidateCard.click();

    // Fill evaluation scorecard
    await expect(page.getByText(/Structured evaluation/i)).toBeVisible();
    await page.getByRole('spinbutton', { name: 'Score out of' }).fill('8');
    await page.getByRole('textbox', { name: 'Feedback comments' }).fill('Demonstrated strong domain competence and thoughtful problem-solving approaches.');

    // Submit Assessment
    await page.getByRole('button', { name: 'Submit assessment' }).click();

    // Verify success banner appears
    await expect(page.getByText(/Feedback submitted successfully/i)).toBeVisible({ timeout: 10000 });
  });
});
