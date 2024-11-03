import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ContentType, contentTypes } from '../constants';

interface HeaderSectionProps {
  contentType: ContentType;
  Icon: LucideIcon;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ contentType, Icon }) => {
  const selectedType = contentTypes.find(t => t.id === contentType);

  return (
    <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
      <div className="p-3 bg-indigo-100 rounded-xl">
        <Icon className="h-8 w-8 text-indigo-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{selectedType?.name}</h2>
        <p className="text-gray-600">{selectedType?.description}</p>
      </div>
    </div>
  );
};

export default HeaderSection;