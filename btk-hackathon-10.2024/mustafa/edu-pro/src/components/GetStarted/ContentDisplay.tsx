import React from 'react';
import { List } from 'lucide-react';
import { ContentType, contentTypes } from './constants';
import WeeklyPlanTable from './WeeklyPlanTable';

interface ContentDisplayProps {
  content: string;
  contentType: ContentType;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, contentType }) => {
  const selectedType = contentTypes.find(t => t.id === contentType);
  const Icon = selectedType?.icon || List;

  const formatContent = (content: string) => {
    if (contentType === 'plan') {
      const weeklyPlanMatch = content.match(/Week \d+[\s\S]*?(?=Week \d+|$)/g);
      if (weeklyPlanMatch) {
        return (
          <>
            {content.split(/Week \d+/)[0]}
            <WeeklyPlanTable weeklyContent={weeklyPlanMatch} />
          </>
        );
      }
    }

    return content.split('\n').map((line, index) => {
      if (line.startsWith('•') || line.startsWith('-')) {
        return (
          <li key={index} className="text-gray-700 leading-relaxed ml-4 mb-2 flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            {line.replace(/^[•-]\s*/, '')}
          </li>
        );
      }
      if (line.match(/^[0-9]+\./)) {
        return (
          <div key={index} className="flex gap-3 mb-4 items-start">
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
              {line.match(/^[0-9]+/)[0]}
            </span>
            <p className="text-gray-700 leading-relaxed flex-1">
              {line.replace(/^[0-9]+\.\s*/, '')}
            </p>
          </div>
        );
      }
      if (line.length > 0) {
        if (line.toLowerCase().includes('key concepts') || 
            line.toLowerCase().includes('objectives') || 
            line.toLowerCase().includes('resources') || 
            line.toLowerCase().includes('assessment')) {
          return (
            <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              {line}
            </h3>
          );
        }
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {line}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <div className="mt-12 bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-8 border border-indigo-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <Icon className="h-8 w-8 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{selectedType?.name}</h2>
          <p className="text-gray-600">{selectedType?.description}</p>
        </div>
      </div>
      <div className="prose prose-lg prose-indigo max-w-none">
        {formatContent(content)}
      </div>
    </div>
  );
};

export default ContentDisplay;