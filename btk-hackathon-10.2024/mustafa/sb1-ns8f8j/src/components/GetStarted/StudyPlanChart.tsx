import React from 'react';
import { Book, Target } from 'lucide-react';

interface ChartProps {
  content: string;
}

const StudyPlanChart: React.FC<ChartProps> = ({ content }) => {
  const parseContent = (content: string) => {
    const weeklyPattern = /Week \d+:([\s\S]*?)(?=Week \d+:|$)/g;
    const weeks = Array.from(content.matchAll(weeklyPattern)).map((match) => {
      const weekNum = match[0].match(/Week (\d+):/)?.[1];
      const content = match[1];
      
      // Extract practice count
      const practiceCount = parseInt(
        content
          .split('\n')
          .find(line => line.toLowerCase().includes('practice:'))
          ?.match(/\d+/)?.[0] || '0'
      );

      // Count topics
      const topicsCount = content
        .split('\n')
        .filter(line => line.trim().startsWith('*'))
        .length;

      return {
        week: parseInt(weekNum || '0'),
        practice: practiceCount,
        topics: topicsCount
      };
    });

    return weeks;
  };

  const data = parseContent(content);
  const maxPractice = Math.max(...data.map(w => w.practice));
  const maxTopics = Math.max(...data.map(w => w.topics));

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-6">Study Progress Overview</h3>
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between">
          {data.map((week, idx) => (
            <div key={week.week} className="flex flex-col items-center gap-2" style={{ width: `${100 / data.length}%` }}>
              {/* Practice Problems Bar */}
              <div className="relative w-full px-1">
                <div
                  className="w-full bg-indigo-500 rounded-t transition-all duration-500"
                  style={{
                    height: `${(week.practice / maxPractice) * 100}%`,
                    maxHeight: '80%'
                  }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                    {week.practice}
                  </div>
                </div>
              </div>
              
              {/* Topics Bar */}
              <div className="relative w-full px-1">
                <div
                  className="w-full bg-green-500 rounded-t transition-all duration-500"
                  style={{
                    height: `${(week.topics / maxTopics) * 100}%`,
                    maxHeight: '80%'
                  }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                    {week.topics}
                  </div>
                </div>
              </div>
              
              <div className="text-xs font-medium text-gray-600 mt-2">
                Week {week.week}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center gap-8 mt-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded"></div>
          <span className="text-sm text-gray-600">Practice Problems</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Topics Covered</span>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanChart;