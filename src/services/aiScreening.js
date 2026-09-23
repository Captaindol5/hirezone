import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const isConfigured = () => Boolean(API_KEY && API_KEY !== 'PASTE_YOUR_KEY_HERE');

/**
 * Screens a candidate's CV text against a job description using Gemini AI.
 * Returns a match score (0–100) and a short summary.
 *
 * @param {string} jobTitle - The job role title.
 * @param {string} jobDepartment - The job department/type.
 * @param {string} cvText - The raw text pasted from the candidate's CV.
 * @returns {Promise<{ score: number, summary: string }>}
 */
export const screenCandidateCv = async (jobTitle, jobDepartment, cvText) => {
  if (!isConfigured()) {
    console.warn('[AI Screening] Gemini API key not configured — using fallback score.');
    return { score: 50, summary: 'AI screening is not configured. Manual review required.' };
  }

  if (!cvText || cvText.trim().length < 50) {
    return { score: 0, summary: 'CV text was too short or empty to evaluate.' };
  }

  const prompt = `
You are a strict, expert HR recruiter screening CVs for HireZone.
The open role is: "${jobTitle}" in the "${jobDepartment}" department.

Here is the candidate's CV text:
---
${cvText.slice(0, 4000)}
---

Based ONLY on the CV text provided, evaluate how well the candidate fits the "${jobTitle}" role.
1. Give a match score from 0 to 100. Be strict. A junior/intern applying for a senior role should get < 30. A candidate with no relevant experience or skills for the specific role should get < 40.
2. Write a single sentence (max 20 words) summarising why the candidate is or isn't a match.

Respond ONLY with valid JSON in this exact format, nothing else:
{ "score": <number>, "summary": "<string>" }
`;

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      summary: String(parsed.summary || 'No summary generated.').slice(0, 200),
    };
  } catch (err) {
    console.error('[AI Screening] Failed to screen CV:', err);
    return { score: null, summary: 'AI screening failed. Manual review required.' };
  }
};
