import React from 'react';
import { List } from 'lucide-react';
import { ContentType, contentTypes } from '../constants';
import HeaderSection from './HeaderSection';
import ContentFormatter from './ContentFormatter';

interface ContentDisplayProps {
  content: string;
  contentType: ContentType;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, contentType }) => {
  const selectedType = contentTypes.find(t => t.id === contentType);
  const Icon = selectedType?.icon || List;

  return (
    <div className="mt-12 bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-8 border border-indigo-100">
      <HeaderSection contentType={contentType} Icon={Icon} />
      <div className="prose prose-lg prose-indigo max-w-none">
        <ContentFormatter content={content} contentType={contentType} />
      </div>
    </div>
  );
};

export default ContentDisplay;