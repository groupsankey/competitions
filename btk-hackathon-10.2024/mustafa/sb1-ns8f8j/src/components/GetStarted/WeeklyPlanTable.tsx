import React from 'react';
import { Calendar, Book, Target, List, CheckCircle } from 'lucide-react';

interface WeekData {
  weekNum: string;
  topics: string[];
  objectives: string[];
  activities: string[];
  assessment: string[];
}

interface WeeklyPlanTableProps {
  weeklyData: WeekData[];
}

const WeeklyPlanTable: React.FC<WeeklyPlanTableProps> = ({ weeklyData }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Week
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Topics
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Objectives
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Activities
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assessment
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {weeklyData.map((week, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Week {week.weekNum}
              </td>
              <td className="px-6 py-4">
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {week.topics.map((topic, i) => (
                    <li key={i}>{topic.replace(/^[•-]\s*/, '')}</li>
                  ))}
                </ul>
              </td>
              <td className="px-6 py-4">
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {week.objectives.map((objective, i) => (
                    <li key={i}>{objective.replace(/^[•-]\s*/, '')}</li>
                  ))}
                </ul>
              </td>
              <td className="px-6 py-4">
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {week.activities.map((activity, i) => (
                    <li key={i}>{activity.replace(/^[•-]\s*/, '')}</li>
                  ))}
                </ul>
              </td>
              <td className="px-6 py-4">
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {week.assessment.map((item, i) => (
                    <li key={i}>{item.replace(/^[•-]\s*/, '')}</li>
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

export default WeeklyPlanTable;