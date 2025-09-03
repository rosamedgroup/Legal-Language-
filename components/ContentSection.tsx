
import React from 'react';

interface Point {
  id: number;
  text: string;
}

interface ContentSectionProps {
  title: string;
  points: Point[];
  textClasses: string;
  searchQuery: string;
}

const slugify = (text: string) => {
  return text.trim().replace(/[\s.,;:'()]/g, '-').toLowerCase();
};

const highlightText = (text: string, highlight: string): React.ReactNode => {
    const lowercasedHighlight = highlight.toLowerCase().trim();
    if (!lowercasedHighlight) {
        return text;
    }
    // Escape special characters for regex
    const escapedHighlight = lowercasedHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === lowercasedHighlight ? (
                    <mark key={i} className="bg-amber-400 text-slate-900 px-1 rounded-sm">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

const ContentSection: React.FC<ContentSectionProps> = ({ title, points, textClasses, searchQuery }) => {
  return (
    <section id={slugify(title)} className="scroll-mt-24">
      <h2 className="text-3xl md:text-4xl font-bold text-amber-400 mb-6 border-r-4 border-amber-500 pr-4">
        {highlightText(title, searchQuery)}
      </h2>
      <ol className="space-y-5">
        {points.map((point) => (
          <li key={point.id} className={`flex items-start ${textClasses}`}>
            <span className="ml-4 text-xl font-bold text-amber-500">{point.id}.</span>
            <span className="flex-1 text-gray-300">{highlightText(point.text, searchQuery)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default ContentSection;
