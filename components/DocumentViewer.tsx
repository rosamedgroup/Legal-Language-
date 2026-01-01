
import React from 'react';
import { Section } from '../data/content';
import { highlightText, slugify } from '../utils';
import Placeholder from './Placeholder';
import { DocumentType } from '../types';

interface DocumentViewerProps {
  activeDocument: DocumentType;
  sections: Section[];
  introduction: any;
  searchQuery: string;
  introductionMatch: boolean;
  textClasses: string;
  bookmarks: string[];
  onToggleBookmark: (docId: DocumentType, slug: string) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  activeDocument,
  sections,
  introduction,
  searchQuery,
  introductionMatch,
  textClasses,
  bookmarks,
  onToggleBookmark
}) => {
  const lowercasedQuery = searchQuery.toLowerCase().trim();

  return (
    <article className="lg:col-span-9 w-full min-w-0">
      <div className="bg-[rgb(var(--background-secondary))] p-5 sm:p-8 lg:p-10 rounded-2xl shadow-sm border border-[rgb(var(--border-primary))] overflow-hidden">
          {introductionMatch && introduction.title && (
            <div 
              id="introduction-section" 
              className="scroll-mt-24 mb-10 sm:mb-16 border-b border-[rgb(var(--border-secondary))] pb-10"
              aria-labelledby="introduction-title"
            >
              <h2 
                id="introduction-title"
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[rgb(var(--text-primary))] mb-6 leading-tight"
              >
                  {highlightText(introduction.title, lowercasedQuery)}
              </h2>
              {introduction.paragraphs && (
                <div className={`space-y-6 text-[rgb(var(--text-secondary))] ${textClasses}`}>
                  {introduction.paragraphs.map((p: string, index: number) => (
                    <p 
                      key={index} 
                      id={`intro-p-${index}`}
                      className="transition-all duration-200 leading-relaxed"
                    >
                      {highlightText(p, lowercasedQuery)}
                    </p>
                  ))}
                </div>
              )}
              {introduction.sections && (
                <div className={`mt-8 space-y-4 text-[rgb(var(--text-secondary))] ${textClasses} border-r-4 border-[rgb(var(--primary)/0.2)] pr-4`}>
                    {introduction.sections.map((s: string, index: number) => (
                        <p key={index} id={`intro-sec-${index}`} className="font-medium leading-relaxed">{highlightText(s, lowercasedQuery)}</p>
                    ))}
                </div>
              )}
              {introduction.conclusion && (
                <p id="intro-conclusion" className={`mt-8 text-[rgb(var(--text-secondary))] font-medium italic opacity-90 ${textClasses} leading-relaxed`}>{highlightText(introduction.conclusion, lowercasedQuery)}</p>
              )}
            </div>
          )}
          
          {sections.length > 0 ? (
            <div className="space-y-16 sm:space-y-20">
              {sections.map((section, sectionIdx) => {
                const sectionSlug = slugify(section.title);
                const isBookmarked = bookmarks.includes(sectionSlug);
                const headerId = `${sectionSlug}-header`;

                return (
                  <section 
                    key={`${section.title}-${sectionIdx}`} 
                    id={sectionSlug} 
                    className="scroll-mt-24 group/section"
                    aria-labelledby={headerId}
                  >
                    <div className="flex justify-between items-start mb-8 sm:mb-10 border-b border-[rgb(var(--border-secondary))] pb-6">
                      <h2 
                        id={headerId}
                        className="text-xl sm:text-2xl lg:text-3xl font-bold text-[rgb(var(--text-primary))] leading-snug"
                      >
                        {highlightText(section.title, searchQuery)}
                      </h2>
                      <button
                          onClick={() => onToggleBookmark(activeDocument, sectionSlug)}
                          title={isBookmarked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                          className={`p-2.5 rounded-full transition-all duration-300 ${
                              isBookmarked 
                              ? 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]' 
                              : 'hover:bg-[rgb(var(--background-tertiary))] text-[rgb(var(--text-tertiary))]'
                          }`}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isBookmarked ? 0 : 2} viewBox="0 0 16 16">
                              <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
                          </svg>
                      </button>
                    </div>

                    {section.metadata && (
                      <div className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                          {Object.entries(section.metadata).map(([key, value], metaIdx) => (
                            <div key={key} id={`${sectionSlug}-meta-${metaIdx}`} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                              <span className="font-bold text-[rgb(var(--text-tertiary))] text-[10px] uppercase tracking-wider">{key}:</span>
                              <span className="text-[rgb(var(--text-primary))] font-medium sm:text-left">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {section.points && (
                      <ol className="space-y-6 list-none">
                        {section.points.map((point) => (
                          <li 
                            key={point.id} 
                            id={`${sectionSlug}-point-${point.id}`}
                            className={`flex items-start group/point ${textClasses}`}
                          >
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[rgb(var(--background-tertiary))] text-[rgb(var(--primary))] font-bold text-sm ml-4 group-hover/point:bg-[rgb(var(--primary))] group-hover/point:text-white transition-colors duration-200">
                              {point.id}
                            </span>
                            <span className="flex-1 text-[rgb(var(--text-secondary))] pt-0.5 leading-relaxed">{highlightText(point.text, searchQuery)}</span>
                          </li>
                        ))}
                      </ol>
                    )}

                    {section.paragraphs && (
                      <div className={`space-y-6 text-[rgb(var(--text-secondary))] ${textClasses}`}>
                          {section.paragraphs.map((paragraph, paraIdx) => (
                              <p 
                                key={paraIdx} 
                                id={`${sectionSlug}-para-${paraIdx}`}
                                className="leading-relaxed"
                              >
                                {highlightText(paragraph, searchQuery)}
                              </p>
                          ))}
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          ) : (
            searchQuery && !introductionMatch && (
              <Placeholder 
                  type="empty" 
                  title="لا توجد نتائج" 
                  message={`لم نتمكن من العثور على أي نتائج لبحثك عن "${searchQuery}". حاول تجربة كلمات مفتاحية أخرى.`} 
              />
            )
          )}
      </div>
    </article>
  );
};

export default DocumentViewer;
