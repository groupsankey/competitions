import React from 'react';
import { BookOpen, PenTool, Globe, Brain, Users, Gamepad } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    name: 'Diverse Curriculum',
    description: 'Comprehensive content for SAT, IELTS, TOEFL, and Turkish educational programs.',
    icon: Globe,
  },
  {
    name: 'Interactive Whiteboard',
    description: 'Real-time collaboration between students and teachers with digital whiteboard integration.',
    icon: PenTool,
    path: '/whiteboard', // Add a path for navigation
  },
  {
    name: 'AI-Powered Learning',
    description: 'Personalized learning paths and recommendations powered by Gemini API.',
    icon: Brain,
  },
  {
    name: 'Study Groups',
    description: 'Form study groups and collaborate with peers on challenging topics.',
    icon: Users,
  },
  {
    name: 'Educational Games',
    description: 'Learn through interactive games and memory-based activities.',
    icon: Gamepad,
  },
  {
    name: 'Progress Tracking',
    description: 'Monitor your learning progress with detailed analytics and insights.',
    icon: BookOpen,
  },
];

export default function Features() {
  const navigate = useNavigate();

  return (
    <div className="py-12 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to excel
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our platform combines cutting-edge technology with proven educational methods to help you achieve your goals.
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
                {feature.path && (
                  <button
                    onClick={() => navigate(feature.path)} // Navigate to the whiteboard
                    className="ml-16 mt-4 text-indigo-600 hover:underline"
                  >
                    Go to Whiteboard
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
