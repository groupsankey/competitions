import React from 'react';
import { Calendar } from 'lucide-react';

interface WeeklyPlanTableProps {
  weeklyContent: string[];
}

const WeeklyPlanTable: React.FC<WeeklyPlanTableProps> = ({ weeklyContent }) => {
  const parseWeekContent = (content: string) => {
    const weekNumber = content.match(/Week (\d+)/)?.[1] || '';
    const topics = content.match(/Topics:(.*?)(?=Objectives:|$)/s)?.[1]?.trim() || '';
    const objectives = content.match(/Objectives:(.*?)(?=Activities:|$)/s)?.[1]?.trim() || '';
    const activities = content.match(/Activities:(.*?)(?=Assessment:|$)/s)?.[1]?.trim() || '';
    const assessment = content.match(/Assessment:(.*?)$/s)?.[1]?.trim() || '';

    return {
      weekNumber,
      topics,
      objectives,
      activities,
      assessment
    };
  };

  return (
    <div className="mt-8 space-y-6">
      {weeklyContent.map((weekContent, index) => {
        const { weekNumber, topics, objectives, activities, assessment } = parseWeekContent(weekContent);
        
        return (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-indigo-100" />
                <h3 className="text-xl font-bold text-white">Week {weekNumber}</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Topics</h4>
                  <div className="text-gray-600">
                    {topics.split('\n').map((topic, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        {topic.replace(/^[•-]\s*/, '')}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Learning Objectives</h4>
                  <div className="text-gray-600">
                    {objectives.split('\n').map((objective, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        {objective.replace(/^[•-]\s*/, '')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Activities</h4>
                  <div className="text-gray-600">
                    {activities.split('\n').map((activity, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        {activity.replace(/^[•-]\s*/, '')}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Assessment</h4>
                  <div className="text-gray-600">
                    {assessment.split('\n').map((item, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                        {item.replace(/^[•-]\s*/, '')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyPlanTable;