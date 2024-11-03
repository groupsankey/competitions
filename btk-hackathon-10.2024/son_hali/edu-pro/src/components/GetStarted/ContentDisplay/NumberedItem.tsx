import React from 'react';

interface NumberedItemProps {
  number: string;
  content: string;
}

const NumberedItem: React.FC<NumberedItemProps> = ({ number, content }) => (
  <div className="flex items-start space-x-4 bg-white rounded-lg p-4 shadow-sm border border-indigo-50 hover:shadow-md transition-shadow duration-200">
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold">
      {number}
    </div>
    <div className="flex-1">
      <p className="text-gray-700 leading-relaxed">
        {content}
      </p>
    </div>
  </div>
);

export default NumberedItem;