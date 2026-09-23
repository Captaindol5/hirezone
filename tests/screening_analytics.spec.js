import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';

const samplePdfPath = fileURLToPath(new URL('./fixtures/sample-cv.pdf', import.meta.url));

test.describe('AI Screening & Executive Analytics', () => {
  test('TC-AI-10: Automated AI Resume Screening & Evaluation on Application', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'CAREERS' }).click();
    await expect(page.getByRole('link', { name: 'APPLY NOW' }).first()).toBeVisible({ timeout: 20000 });
    await page.getByRole('link', { name: 'APPLY NOW' }).first().click();

    await page.getByRole('textbox', { name: 'e.g. Saman Perera' }).fill('George Smith');
    await page.getByRole('textbox', { name: 'you@email.com' }).fill('nubaidhahamed2006@gmail.com');
    await page.getByRole('textbox', { name: '+94 71 234' }).fill('0778012596');

    // Attach CV PDF and verify extraction
    await page.locator('input[type="file"]').setInputFiles(samplePdfPath);
    await expect(page.getByText('✓ Extracted successfully')).toBeVisible({ timeout: 15000 });

    // Fill Screening Q&A
    const answerInputs = page.getByRole('textbox', { name: 'Type your answer here...' });
    const count = await answerInputs.count();
    for (let i = 0; i < count; i++) {
      await answerInputs.nth(i).fill('Experienced professional with strong technical expertise, automation skills, and dedication.');
    }

    // Submit and trigger AI evaluation
    await page.getByRole('button', { name: 'Submit & Evaluate' }).click();

    // Verify Application Submitted & AI Evaluation Complete
    await expect(page.getByText(/Application Submitted!/i)).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/AI Evaluation Complete/i)).toBeVisible();
  });

  test('TC-AI-10a: View AI Screening Report and Resume in Interviewer Portal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('abhi@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Abhi@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();

    // Select candidate from queue dynamically
    await expect(page.getByText('Queue')).toBeVisible({ timeout: 20000 });
    const candidateBtn = page.locator('aside button').first();
    await expect(candidateBtn).toBeVisible({ timeout: 15000 });
    await candidateBtn.click();

    // Verify AI Screening Report and Resume Preview
    await expect(page.getByText(/AI Screening Report/i)).toBeVisible();
    await expect(page.getByText(/Resume Preview/i)).toBeVisible();
    await expect(page.getByText(/Confidence|Fit Score/i).first()).toBeVisible();
  });

  test('TC-AI-11: Executive Comparison Matrix & Pipeline Analytics', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'PORTAL' }).click();
    await page.getByRole('textbox', { name: 'name@company.com' }).fill('sarah@hirezone.com');
    await page.getByRole('textbox', { name: 'Enter password' }).fill('Sarah@123');
    await page.getByRole('button', { name: 'Sign in to portal' }).click();

    // Verify Manager dashboard access
    await expect(page.getByRole('heading', { name: 'Executive Manager' })).toBeVisible({ timeout: 20000 });

    // Verify executive metrics cards
    await expect(page.getByText(/Live candidates/i)).toBeVisible();

    // Verify Hiring Funnel & Stage Overview
    await expect(page.getByRole('heading', { name: 'Hiring funnel' })).toBeVisible();
    await expect(page.getByText(/Initial Interview/i).first()).toBeVisible();

    // Verify Candidate Pipeline List
    await expect(page.getByRole('heading', { name: 'Who is where' })).toBeVisible();
    await expect(page.getByText(/George Smith|Navin Manathunga|Jerry Perera/i).first()).toBeVisible();

    // Verify Per-role Summary Breakdown
    await expect(page.getByRole('heading', { name: 'Per-role summary' })).toBeVisible();
    await expect(page.getByText(/Quality Assurance Engineer/i).first()).toBeVisible();
  });
});
