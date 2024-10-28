import React from 'react';
import { BookOpen, GraduationCap, Languages, Calculator } from 'lucide-react';

const programs = [
  {
    name: 'SAT Preparation',
    icon: Calculator,
    description: 'Comprehensive preparation for SAT Math, Reading, and Writing sections.',
    features: ['Practice Tests', 'Video Lessons', 'Score Analytics'],
  },
  {
    name: 'IELTS & TOEFL',
    icon: Languages,
    description: 'Master English proficiency tests with expert guidance and practice.',
    features: ['Speaking Practice', 'Writing Feedback', 'Mock Tests'],
  },
  {
    name: 'Turkish Curriculum',
    icon: BookOpen,
    description: 'Aligned with national education standards and university entrance exams.',
    features: ['Video Lectures', 'Practice Questions', 'Live Sessions'],
  },
  {
    name: 'Advanced Placement',
    icon: GraduationCap,
    description: 'AP courses and exam preparation for college-level recognition.',
    features: ['Study Materials', 'Progress Tracking', 'Expert Support'],
  },
];

export default function Curriculum() {
  return (
    <div className="py-24 bg-gray-50" id="curriculum">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose Your Path
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Tailored programs designed to help you achieve your academic goals
          </p>
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-2">
          {programs.map((program) => (
            <div
              key={program.name}
              className="relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50">
                  <program.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="ml-4 text-xl font-semibold text-gray-900">{program.name}</h3>
              </div>
              <p className="mt-4 text-gray-500">{program.description}</p>
              <ul className="mt-6 space-y-3">
                {program.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full bg-gray-50 text-gray-900 py-3 px-4 rounded-xl font-medium hover:bg-gray-100 transition-colors duration-200">
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
