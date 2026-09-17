const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

// Helper to safely parse JSON out of Gemini's response
function extractJSON(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

// Retries a Gemini call a few times if the model is temporarily overloaded (503)
async function generateWithRetry(prompt, retries = 3, delayMs = 1500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      const isOverloaded = err.message?.includes('503') || err.message?.includes('overloaded') || err.message?.includes('high demand');
      const isLastAttempt = attempt === retries;

      if (isOverloaded && !isLastAttempt) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }

      throw err;
    }
  }
}

async function generateSummary(text) {
  const prompt = `Summarize the following study material in clear, concise paragraphs suitable for a student reviewing before an exam. Keep it under 300 words.\n\nMaterial:\n${text}`;
  const result = await generateWithRetry(prompt);
  return result.response.text();
}

async function generateQuiz(text) {
  const prompt = `Based on the following study material, generate 10 multiple-choice quiz questions. Respond ONLY with valid JSON in this exact format, no other text:
{"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "..."}]}

Material:
${text}`;
  const result = await generateWithRetry(prompt);
  const parsed = extractJSON(result.response.text());
  return parsed.questions;
}

async function generateFlashcards(text) {
  const prompt = `Based on the following study material, generate 8 flashcards (term/concept on front, explanation on back). Respond ONLY with valid JSON in this exact format, no other text:
{"cards": [{"front": "...", "back": "..."}]}

Material:
${text}`;
  const result = await generateWithRetry(prompt);
  const parsed = extractJSON(result.response.text());
  return parsed.cards;
}

async function generateChatResponse(history, documentText, question) {
  const systemContext = documentText
    ? `You are a helpful study assistant. Answer the student's questions using ONLY the material below when relevant. If the answer isn't in the material, say so honestly.

Material:
${documentText}`
    : `You are a helpful study assistant. Answer the student's academic questions clearly and accurately. When the student refers to "that", "it", "the above answer", or asks you to explain something "simply", "shorter", "again", etc., they are referring to your most recent reply in this conversation — use the conversation history to understand what they mean rather than treating each message as unrelated.`;

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemContext }] },
      { role: 'model', parts: [{ text: 'Understood. I will use our conversation history to understand follow-up questions and references to earlier answers.' }] },
      ...history,
    ],
  });

  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await chat.sendMessage(question);
      return result.response.text();
    } catch (err) {
      lastErr = err;
      const isOverloaded = err.message?.includes('503') || err.message?.includes('overloaded') || err.message?.includes('high demand');
      if (isOverloaded && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

module.exports = { generateSummary, generateQuiz, generateFlashcards, generateChatResponse };