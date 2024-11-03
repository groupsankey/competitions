import { Target, BookCheck, Lightbulb, Brain } from 'lucide-react';

export type ContentType = 'plan' | 'questions' | 'explanation' | 'tips';

export const contentTypes = [
  { 
    id: 'plan', 
    name: 'Personalized Study Plan', 
    icon: Target, 
    description: 'Get a customized learning roadmap tailored to your goals' 
  },
  { 
    id: 'questions', 
    name: 'Interactive Practice', 
    icon: BookCheck, 
    description: 'Challenge yourself with AI-generated questions' 
  },
  { 
    id: 'explanation', 
    name: 'Smart Topic Breakdown', 
    icon: Lightbulb, 
    description: 'Complex concepts explained in simple terms' 
  },
  { 
    id: 'tips', 
    name: 'Learning Strategies', 
    icon: Brain, 
    description: 'Proven techniques for better understanding' 
  },
];