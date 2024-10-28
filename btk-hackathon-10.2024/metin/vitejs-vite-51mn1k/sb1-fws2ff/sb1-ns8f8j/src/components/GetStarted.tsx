import React, { useState } from 'react';
import { 
  generateStudyPlan, 
  generatePracticeQuestions, 
  getTopicExplanation,
  getStudyTips
} from '../lib/gemini';
import { BookOpen, Brain, HelpCircle, List } from 'lucide-react';

type ContentType = 'plan' | 'questions' | 'explanation' | 'tips';

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

  const contentTypes = [
    { id: 'plan', name: 'Study Plan', icon: List },
    { id: 'questions', name: 'Practice Questions', icon: HelpCircle },
    { id: 'explanation', name: 'Topic Explanation', icon: BookOpen },
    { id: 'tips', name: 'Study Tips', icon: Brain },
  ];

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Personalized Learning Assistant</h1>
        
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setContentType(type.id as ContentType)}
                className={`p-4 rounded-xl flex flex-col items-center justify-center space-y-2 transition-all ${
                  contentType === type.id
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <type.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
              What would you like to learn about?
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., SAT Math, IELTS Writing, AP Biology"
            />
          </div>

          {contentType === 'questions' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <div className="flex space-x-4">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      difficulty === level
                        ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {contentType === 'tips' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Style
              </label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="kinesthetic">Kinesthetic</option>
                <option value="reading/writing">Reading/Writing</option>
              </select>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
        </form>

        {content && (
          <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {contentTypes.find(t => t.id === contentType)?.name}
            </h2>
            <div className="prose prose-indigo max-w-none">
              {content.split('\n').map((line, index) => (
                <p key={index} className="mb-4">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}