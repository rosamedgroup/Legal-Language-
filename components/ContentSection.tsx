import React, { useState, useEffect } from 'react';
import { Point, Section as SectionType } from '../data/content';
// FIX: Imported getRelatedSections from utils to resolve module not found error.
import { slugify, highlightText, getRelatedSections } from '../utils';

interface ContentSectionProps {
  title: string;
  points?: Point[];
  paragraphs?: string[];
  textClasses: string;
  searchQuery: string;
  allSections: SectionType[];
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({ 
  title, 
  points, 
  paragraphs, 
  textClasses, 
  searchQuery, 
  allSections,
  isBookmarked,
  onToggleBookmark
}) => {
  // FIX: Replaced useMemo with useState and useEffect to handle asynchronous data fetching from getRelatedSections.
  const [relatedSections, setRelatedSections] = useState<string[]>([]);

  useEffect(() => {
    const currentSection: SectionType = { title, points, paragraphs };
    getRelatedSections(currentSection, allSections)
      .then(titles => {
        setRelatedSections(titles);
      })
      .catch(error => {
        console.error("Failed to fetch related sections:", error);
        setRelatedSections([]);
      });
  }, [title, points, paragraphs, allSections]);

  return (
    <section id={slugify(title)} className="scroll-mt-24">
      <div className="flex justify-between items-start mb-5 border-b border-slate-200 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
          {highlightText(title, searchQuery)}
        </h2>
        <div className="flex items-center gap-1 -mr-2">
          <button
            onClick={onToggleBookmark}
            aria-label={isBookmarked ? `Remove bookmark for section: ${title}` : `Bookmark section: ${title}`}
            className="p-2 rounded-full hover:bg-slate-200/60 text-slate-500 transition-colors duration-200"
          >
            {isBookmarked ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {points && (
        <ol className="space-y-5">
          {points.map((point) => (
            <li key={point.id} className={`flex items-start ${textClasses}`}>
              <span className="ml-4 text-lg font-bold text-slate-500">{point.id}.</span>
              <span className="flex-1 text-slate-700">{highlightText(point.text, searchQuery)}</span>
            </li>
          ))}
        </ol>
      )}

      {paragraphs && (
        <div className={`space-y-5 text-slate-700 ${textClasses}`}>
            {paragraphs.map((paragraph, index) => (
                <p key={index}>{highlightText(paragraph, searchQuery)}</p>
            ))}
        </div>
      )}

      {relatedSections.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200/80 related-sections-container">
          <h3 className="text-base font-semibold text-slate-800 mb-3">
            أقسام ذات صلة
          </h3>
          <ul className="space-y-2">
            {relatedSections.map((relatedTitle, index) => (
              <li key={index}>
                <a
                  href={`#${slugify(relatedTitle)}`}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                  </svg>
                  <span>{relatedTitle}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ContentSection;