import React from 'react';
import { Book, Target, Clock, CheckSquare } from 'lucide-react';

interface WeeklyData {
  week: number;
  topics: string[];
  practice: string;
  milestones: string[];
}

const StudyPlanTable: React.FC<{ content: string }> = ({ content }) => {
  const parseContent = (content: string): WeeklyData[] => {
    const weeklyPattern = /Week \d+:([\s\S]*?)(?=Week \d+:|$)/g;
    const weeks = Array.from(content.matchAll(weeklyPattern)).map((match) => {
      const weekNum = match[0].match(/Week (\d+):/)?.[1];
      const content = match[1];
      
      // Extract topics (bullet points)
      const topics = content
        .split('\n')
        .filter(line => line.trim().startsWith('*'))
        .map(line => line.replace('*', '').trim());
      
      // Extract practice information
      const practice = content
        .split('\n')
        .find(line => line.toLowerCase().includes('practice:'))
        ?.replace('Practice:', '')
        .trim() || '';

      // Extract milestones
      const milestones = content
        .split('\n')
        .filter(line => line.includes(':') && !line.includes('Week') && !line.includes('Practice:'))
        .map(line => line.trim());

      return {
        week: parseInt(weekNum || '0'),
        topics,
        practice,
        milestones
      };
    });

    return weeks;
  };

  const weeklyData = parseContent(content);

  return (
    <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
              Week
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Topics
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Practice Goals
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Milestones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {weeklyData.map((week) => (
            <tr key={week.week} className="hover:bg-gray-50">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                Week {week.week}
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                <ul className="list-none space-y-1">
                  {week.topics.map((topic, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-indigo-500" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span>{week.practice}</span>
                </div>
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                <ul className="list-none space-y-1">
                  {week.milestones.map((milestone, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-orange-500" />
                      <span>{milestone}</span>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudyPlanTable;