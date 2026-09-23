import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const isConfigured = () => Boolean(API_KEY && API_KEY !== 'PASTE_YOUR_KEY_HERE');

/**
 * Evaluates a candidate's application (CV + Answers to screening questions) in one shot.
 * @param {string} jobTitle - The role the candidate is applying for.
 * @param {string} cvText - The extracted text from the candidate's CV.
 * @param {Array<{question: string, answer: string}>} qnaList - The HR questions and candidate answers.
 * @returns {Promise<{score: number, summary: string}>}
 */
export const evaluateApplication = async (jobTitle, cvText, qnaList) => {
  if (!isConfigured()) {
    throw new Error('The AI screening feature is not configured yet. Please add your VITE_GEMINI_API_KEY to the .env file.');
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Build the bulk evaluation prompt
    let qnaText = '';
    qnaList.forEach((item, i) => {
      qnaText += `Q${i + 1}: ${item.question}\nA${i + 1}: ${item.answer}\n\n`;
    });

    const systemPrompt = `
You are a sharp, professional technical recruiter for HireZone.
The candidate is applying for the role of: "${jobTitle}".

Here is their CV / Resume text:
---
${cvText ? cvText.slice(0, 4000) : 'No CV provided.'}
---

Here are their answers to the HR screening questions:
---
${qnaText || 'No questions answered.'}
---

Your task:
1. Critically evaluate the candidate's answers against their CV experience and standard expectations for a "${jobTitle}" role.
2. Are the answers highly relevant, technically accurate, and detailed? Or are they vague, generic, or potentially AI-generated?
3. Score the candidate on a scale of 0 to 100 based on their overall fit and answer quality.
4. Provide a concise, 2-3 sentence summary explaining your evaluation.

You MUST output ONLY a valid JSON object in this exact format:
{
  "score": <number from 0 to 100>,
  "summary": "<2-3 sentences explaining the evaluation>"
}
Do NOT output any markdown blocks (like \`\`\`json). Just the raw JSON object.
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      systemInstruction: "You are an automated evaluator. Always respond in pure JSON format without markdown ticks.",
    });

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text().trim();
    
    // Clean up potential markdown formatting if the AI ignores the instruction
    const cleanJsonText = text.replace(/```json|```/g, '').trim();

    const parsed = JSON.parse(cleanJsonText);
    
    let parsedScore = 0;
    if (parsed.score !== undefined && parsed.score !== null) {
      const num = Number(parsed.score);
      if (!isNaN(num)) parsedScore = num;
    }
    
    return {
      score: parsedScore,
      summary: parsed.summary || 'Candidate evaluated successfully.',
    };

  } catch (err) {
    console.warn('[AI Service] Gemini API failed. Falling back to traditional ATS scoring...', err);
    
    // Non-AI ATS Fallback Scoring Algorithm
    let score = 50; // Baseline score
    
    // 1. Keyword Matching (Job Title heuristics)
    const normalizedJob = jobTitle.toLowerCase();
    const normalizedCv = cvText.toLowerCase();
    
    const techKeywords = ['react', 'node', 'javascript', 'python', 'java', 'aws', 'cloud', 'sql', 'api', 'docker', 'agile', 'engineering'];
    const designKeywords = ['ui', 'ux', 'figma', 'design', 'user', 'interface', 'wireframe', 'prototype', 'creative'];
    const hrKeywords = ['management', 'leadership', 'communication', 'strategy', 'planning', 'business', 'sales', 'marketing'];
    
    let relevantKeywords = [];
    if (normalizedJob.includes('engineer') || normalizedJob.includes('developer') || normalizedJob.includes('tech')) {
      relevantKeywords = techKeywords;
    } else if (normalizedJob.includes('design') || normalizedJob.includes('ui') || normalizedJob.includes('ux')) {
      relevantKeywords = designKeywords;
    } else {
      relevantKeywords = hrKeywords;
    }
    
    // Add points for keyword matches in CV
    let matchCount = 0;
    relevantKeywords.forEach(kw => {
      if (normalizedCv.includes(kw)) matchCount++;
    });
    
    score += Math.min(25, matchCount * 5); // Up to 25 points for keyword matches
    
    // 2. CV Completeness (Length check)
    if (cvText.length > 500) score += 10;
    if (cvText.length > 1500) score += 5;
    
    // 3. QnA Quality (Length/Effort check)
    if (qnaList && qnaList.length > 0) {
      let qnaScore = 0;
      qnaList.forEach(item => {
        if (item.answer.length > 20) qnaScore += 2;
        if (item.answer.length > 100) qnaScore += 3;
      });
      score += Math.min(10, qnaScore); // Up to 10 points for good answers
    } else {
      score += 5; // Default points if no questions were asked
    }
    
    // Ensure score doesn't exceed 100
    const finalScore = Math.min(100, Math.max(0, score));

    return {
      score: finalScore,
      summary: `Traditional ATS Evaluation (AI Unavailable): Candidate achieved a score of ${finalScore}/100 based on keyword matching, CV completeness, and questionnaire effort.`,
    };
  }
};
