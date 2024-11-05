import React, { useState } from 'react';
import { 
  generateStudyPlan, 
  generatePracticeQuestions, 
  getTopicExplanation,
  getStudyTips
} from '../../lib/gemini';
import { Sparkles } from 'lucide-react';
import { ContentType, contentTypes } from './constants';
import ContentDisplay from './ContentDisplay';

export default function GetStarted() {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState<ContentType>('plan');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [learningStyle, setLearningStyle] = useState('visual');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setLoading(true);
    try {
      let result = '';
      switch (contentType) {
        case 'plan':
          result = await generateStudyPlan(topic);
          break;
        case 'questions':
          result = await generatePracticeQuestions(topic, difficulty);
          break;
        case 'explanation':
          result = await getTopicExplanation(topic);
          break;
        case 'tips':
          result = await getStudyTips(topic, learningStyle);
          break;
      }
      setContent(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight sm:text-6xl">
            Transform Your Learning Journey
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Experience personalized education powered by advanced AI technology
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setContentType(type.id as ContentType)}
                  className={`p-6 rounded-xl flex flex-col items-center justify-center space-y-3 transition-all ${
                    contentType === type.id
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg scale-105 transform'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-102 transform'
                  }`}
                >
                  <type.icon className={`h-8 w-8 ${contentType === type.id ? 'text-white' : 'text-indigo-600'}`} />
                  <span className="text-sm font-medium text-center">{type.name}</span>
                  <p className="text-xs opacity-75 text-center">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-lg font-medium text-gray-900 mb-3">
                What would you like to learn about?
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-4 px-6 bg-gray-50"
                placeholder="e.g., SAT Math, IELTS Writing, AP Biology"
              />
            </div>

            {contentType === 'questions' && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block text-lg font-medium text-gray-900 mb-3">
                  Select Challenge Level
                </label>
                <div className="flex space-x-4">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className={`px-6 py-3 rounded-xl capitalize text-lg font-medium transition-all ${
                        difficulty === level
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {contentType === 'tips' && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block text-lg font-medium text-gray-900 mb-3">
                  Your Learning Style
                </label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-4 px-6 bg-white"
                >
                  <option value="visual">Visual Learner</option>
                  <option value="auditory">Auditory Learner</option>
                  <option value="kinesthetic">Hands-on Learner</option>
                  <option value="reading/writing">Reading/Writing Learner</option>
                </select>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-102"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating your personalized learning experience...
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6 mr-2" />
                  Generate Personalized Content
                </>
              )}
            </button>
          </form>

          {content && <ContentDisplay content={content} contentType={contentType} />}
        </div>
      </div>
    </div>
  );
}