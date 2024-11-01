import React from 'react';

interface ChartData {
  weekNum: string;
  topics: string[];
  objectives: string[];
}

interface ProgressChartProps {
  data: ChartData[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const totalWeeks = data.length;
  const maxTopics = Math.max(...data.map(week => week.topics.length));
  const maxObjectives = Math.max(...data.map(week => week.objectives.length));

  return (
    <div className="mt-8 p-4 bg-white rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Weekly Progress Overview</h3>
      <div className="relative h-60">
        {data.map((week, idx) => {
          const topicsHeight = (week.topics.length / maxTopics) * 100;
          const objectivesHeight = (week.objectives.length / maxObjectives) * 100;
          const barWidth = `${90 / totalWeeks}%`;
          const leftPosition = `${(idx * 90) / (totalWeeks - 1)}%`;

          return (
            <div
              key={idx}
              className="absolute bottom-0 flex gap-2"
              style={{ left: leftPosition, transform: 'translateX(-50%)' }}
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-4 bg-indigo-500 rounded-t"
                  style={{ height: `${topicsHeight}%` }}
                ></div>
                <span className="text-xs mt-2">W{week.weekNum}</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="w-4 bg-green-500 rounded-t"
                  style={{ height: `${objectivesHeight}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded"></div>
          <span className="text-sm text-gray-600">Topics</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Objectives</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;