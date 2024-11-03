import React from 'react';
import BulletPoint from './BulletPoint';
import NumberedItem from './NumberedItem';
import SectionHeader from './SectionHeader';
import Table from './Table';
import { ContentType } from '../constants';
import WeeklyPlanTable from '../WeeklyPlanTable';

interface ContentFormatterProps {
  content: string;
  contentType: ContentType;
}

const ContentFormatter: React.FC<ContentFormatterProps> = ({ content, contentType }) => {
  const formatTableContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    const rows = lines.slice(2).map(line => 
      line.split('|').map(cell => cell.trim()).filter(Boolean)
    );
    return { headers, rows };
  };

  const processContent = (text: string) => {
    const sections: JSX.Element[] = [];
    let currentSection: string[] = [];
    let isTable = false;
    let tableContent: string[] = [];

    text.split('\n').forEach((line, index) => {
      if (line.includes('|') && line.split('|').length > 2) {
        if (!isTable) {
          if (currentSection.length) {
            sections.push(
              <div key={`section-${index}`} className="space-y-4">
                {formatSection(currentSection)}
              </div>
            );
            currentSection = [];
          }
          isTable = true;
        }
        tableContent.push(line);
      } else {
        if (isTable) {
          const { headers, rows } = formatTableContent(tableContent.join('\n'));
          sections.push(
            <div key={`table-${index}`} className="my-6">
              <Table headers={headers} rows={rows} />
            </div>
          );
          tableContent = [];
          isTable = false;
        }
        currentSection.push(line);
      }
    });

    if (isTable && tableContent.length) {
      const { headers, rows } = formatTableContent(tableContent.join('\n'));
      sections.push(
        <div key="table-final" className="my-6">
          <Table headers={headers} rows={rows} />
        </div>
      );
    } else if (currentSection.length) {
      sections.push(
        <div key="section-final" className="space-y-4">
          {formatSection(currentSection)}
        </div>
      );
    }

    return sections;
  };

  const formatSection = (lines: string[]) => {
    return lines.map((line, index) => {
      if (!line.trim()) return null;

      if (line.startsWith('•') || line.startsWith('-')) {
        return <BulletPoint key={index} content={line} />;
      }

      if (line.match(/^[0-9]+\./)) {
        const [number] = line.match(/^[0-9]+/) || [''];
        const content = line.replace(/^[0-9]+\.\s*/, '');
        return <NumberedItem key={index} number={number} content={content} />;
      }

      const sectionHeader = <SectionHeader key={index} content={line} />;
      if (sectionHeader.props.children) return sectionHeader;

      if (line.match(/^[A-Z][\w\s-]+:/)) {
        return (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <h4 className="font-semibold text-gray-900 mb-2">{line}</h4>
          </div>
        );
      }

      return (
        <p key={index} className="text-gray-700 leading-relaxed px-4">
          {line}
        </p>
      );
    });
  };

  if (contentType === 'plan') {
    const weeklyPlanMatch = content.match(/Week \d+[\s\S]*?(?=Week \d+|$)/g);
    if (weeklyPlanMatch) {
      const introduction = content.split(/Week \d+/)[0];
      return (
        <div className="space-y-6">
          {introduction && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
              <div className="prose prose-indigo max-w-none">
                {processContent(introduction)}
              </div>
            </div>
          )}
          <WeeklyPlanTable weeklyContent={weeklyPlanMatch} />
        </div>
      );
    }
  }

  return <div className="space-y-6">{processContent(content)}</div>;
};

export default ContentFormatter;