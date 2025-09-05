
import React, { useMemo } from 'react';
import { Point, Section as SectionType } from '../data/content';
import { slugify, highlightText, findRelatedSections } from '../utils';

interface ContentSectionProps {
  title: string;
  points?: Point[];
  paragraphs?: string[];
  textClasses: string;
  searchQuery: string;
  onShare: (title: string, slug: string) => void;
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
  onShare, 
  allSections,
  isBookmarked,
  onToggleBookmark
}) => {
  const relatedSections = useMemo(
    () => findRelatedSections(title, allSections),
    [title, allSections]
  );

  return (
    <section id={slugify(title)} className="scroll-mt-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-amber-400 border-r-4 border-amber-500 pr-4">
          {highlightText(title, searchQuery)}
        </h2>
        <div className="flex items-center gap-1 -mr-2">
          <button
            onClick={onToggleBookmark}
            aria-label={isBookmarked ? `Remove bookmark for section: ${title}` : `Bookmark section: ${title}`}
            className="p-2 rounded-full hover:bg-slate-700/70 text-gray-400 hover:text-amber-400 transition-colors duration-200"
          >
            {isBookmarked ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onShare(title, slugify(title))}
            aria-label={`Share section: ${title}`}
            className="p-2 rounded-full hover:bg-slate-700/70 text-gray-400 hover:text-amber-400 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
      </div>
      
      {points && (
        <ol className="space-y-5">
          {points.map((point) => (
            <li key={point.id} className={`flex items-start ${textClasses}`}>
              <span className="ml-4 text-xl font-bold text-amber-500">{point.id}.</span>
              <span className="flex-1 text-gray-300">{highlightText(point.text, searchQuery)}</span>
            </li>
          ))}
        </ol>
      )}

      {paragraphs && (
        <div className={`space-y-5 text-gray-300 ${textClasses}`}>
            {paragraphs.map((paragraph, index) => (
                <p key={index}>{highlightText(paragraph, searchQuery)}</p>
            ))}
        </div>
      )}

      {relatedSections.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <h3 className="text-xl font-semibold text-amber-300 mb-3">
            أقسام ذات صلة
          </h3>
          <ul className="space-y-2">
            {relatedSections.map((relatedTitle, index) => (
              <li key={index}>
                <a
                  href={`#${slugify(relatedTitle)}`}
                  className="flex items-center text-gray-300 hover:text-amber-400 transition-colors duration-200 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-amber-500 group-hover:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
