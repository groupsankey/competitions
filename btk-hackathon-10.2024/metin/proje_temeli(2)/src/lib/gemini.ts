import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateStudyPlan(topic: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `Create a detailed study plan for: ${topic}.
    Include:
    - Key concepts and learning objectives
    - Weekly breakdown of topics
    - Practice exercises and assignments
    - Recommended resources
    - Assessment milestones
    Format the response with clear sections and bullet points.`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating study plan:', error);
    throw error;
  }
}

export async function generatePracticeQuestions(topic: string, difficulty: 'easy' | 'medium' | 'hard') {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `Generate 5 ${difficulty} level practice questions for ${topic}.
    For each question include:
    - The question
    - Multiple choice options (if applicable)
    - Detailed solution
    - Key concepts tested`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating practice questions:', error);
    throw error;
  }
}

export async function getTopicExplanation(topic: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `Explain ${topic} in detail.
    Include:
    - Main concepts and definitions
    - Real-world examples and applications
    - Common misconceptions
    - Visual descriptions or diagrams (if applicable)
    - Tips for understanding`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting topic explanation:', error);
    throw error;
  }
}

export async function generateProgressAssessment(topics: string[], performance: Record<string, number>) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `Based on the student's performance in ${topics.join(', ')},
    with scores ${JSON.stringify(performance)}, provide:
    - Strengths and areas for improvement
    - Recommended focus areas
    - Study strategies
    - Next steps for improvement`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating progress assessment:', error);
    throw error;
  }
}

export async function getStudyTips(topic: string, learningStyle: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = `Provide study tips for ${topic} tailored to ${learningStyle} learning style.
    Include:
    - Specific study techniques
    - Time management suggestions
    - Memory aids and mnemonics
    - Recommended resources
    - Practice strategies`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting study tips:', error);
    throw error;
  }
}