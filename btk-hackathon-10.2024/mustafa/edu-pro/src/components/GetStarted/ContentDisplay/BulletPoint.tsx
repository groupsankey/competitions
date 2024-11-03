import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface BulletPointProps {
  content: string;
}

const BulletPoint: React.FC<BulletPointProps> = ({ content }) => (
  <div className="flex items-start space-x-3 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
    <CheckCircle2 className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
    <span className="text-gray-700 leading-relaxed">
      {content.replace(/^[•-]\s*/, '')}
    </span>
  </div>
);

export default BulletPoint;