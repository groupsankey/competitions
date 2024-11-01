import React, { useState } from 'react';
import { List, LayoutGrid, Table as TableIcon, BarChart } from 'lucide-react';
import { ContentType, contentTypes } from './constants';
import StudyPlanTable from './components/StudyPlanTable';
import StudyPlanChart from './components/StudyPlanChart';

interface ContentDisplayProps {
  content: string;
  contentType: ContentType;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, contentType }) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const selectedType = contentTypes.find(t => t.id === contentType);
  const Icon = selectedType?.icon || List;

  const renderContent = () => {
    if (contentType === 'plan') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  viewMode === 'table' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TableIcon className="h-5 w-5" />
                <span className="text-sm">Table View</span>
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  viewMode === 'chart' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart className="h-5 w-5" />
                <span className="text-sm">Progress Chart</span>
              </button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <StudyPlanTable content={content} />
          ) : (
            <StudyPlanChart content={content} />
          )}
        </div>
      );
    }

    return (
      <div className="prose prose-lg prose-indigo max-w-none">
        {content.split('\n').map((line, index) => {
          if (line.startsWith('*')) {
            return (
              <div key={index} className="flex items-center gap-3 mb-3">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="text-gray-700">{line.replace('*', '').trim()}</span>
              </div>
            );
          }
          if (line.match(/^[0-9]+\./)) {
            return (
              <div key={index} className="flex gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                  {line.match(/^[0-9]+/)?.[0]}
                </span>
                <p className="text-gray-700 flex-1">{line.replace(/^[0-9]+\.\s*/, '')}</p>
              </div>
            );
          }
          if (line.length > 0) {
            if (line.toLowerCase().includes('key concepts') || 
                line.toLowerCase().includes('objectives') || 
                line.toLowerCase().includes('resources') || 
                line.toLowerCase().includes('assessment')) {
              return (
                <h3 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                  {line}
                </h3>
              );
            }
            return (
              <p key={index} className="text-gray-700 mb-4">
                {line}
              </p>
            );
          }
          return null;
        })}
      </div>
    );
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
      {renderContent()}
    </div>
  );
};

export default ContentDisplay;