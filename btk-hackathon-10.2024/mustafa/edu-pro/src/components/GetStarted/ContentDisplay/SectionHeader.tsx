import React from 'react';
import { BookOpen, Target, Brain, LucideIcon, Lightbulb, BookCheck } from 'lucide-react';

interface SectionConfig {
  icon: LucideIcon;
  gradient: string;
  border: string;
  iconColor: string;
  bgColor: string;
}

const sectionConfigs: Record<string, SectionConfig> = {
  'key concepts': {
    icon: BookOpen,
    gradient: 'from-indigo-500/10',
    border: 'border-indigo-500',
    iconColor: 'text-indigo-500',
    bgColor: 'bg-indigo-50'
  },
  'objectives': {
    icon: Target,
    gradient: 'from-blue-500/10',
    border: 'border-blue-500',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  'learning strategies': {
    icon: Brain,
    gradient: 'from-purple-500/10',
    border: 'border-purple-500',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50'
  },
  'tips': {
    icon: Lightbulb,
    gradient: 'from-amber-500/10',
    border: 'border-amber-500',
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50'
  },
  'practice': {
    icon: BookCheck,
    gradient: 'from-green-500/10',
    border: 'border-green-500',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50'
  }
};

interface SectionHeaderProps {
  content: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ content }) => {
  const config = Object.entries(sectionConfigs).find(([key]) => 
    content.toLowerCase().includes(key)
  )?.[1];

  if (!config) return null;

  const { icon: Icon, gradient, border, iconColor, bgColor } = config;

  return (
    <div className={`${bgColor} rounded-lg shadow-sm overflow-hidden`}>
      <div className={`bg-gradient-to-r ${gradient} to-transparent p-4 border-l-4 ${border}`}>
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconColor} bg-white/80`}>
            <Icon className="h-5 w-5" />
          </div>
          {content}
        </h3>
      </div>
    </div>
  );
};

export default SectionHeader;