import React, { useState } from 'react';
import { Section } from '../data/content';
import { slugify } from '../utils';

interface TableOfContentsProps {
  sections: Section[];
  bookmarkedSections: Section[];
  onToggleBookmark: (slug: string) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections, bookmarkedSections, onToggleBookmark }) => {
  const [jumpQuery, setJumpQuery] = useState('');

  const filteredTocSections = sections.filter(section => 
    section.title.toLowerCase().includes(jumpQuery.toLowerCase().trim())
  );

  return (
    <div className="lg:fixed lg:top-24 pr-4 lg:w-64">
      {bookmarkedSections.length > 0 && (
        <div className="mb-6 pb-4 border-b border-slate-200">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
            </svg>
            المفضلة
          </h3>
          <nav aria-label="Bookmarked sections">
            <ol className="space-y-2">
              {bookmarkedSections.map((section) => (
                <li key={`bookmark-${section.title}`} className="group flex justify-between items-center gap-2">
                  <a
                    href={`#${slugify(section.title)}`}
                    className="flex-1 text-sm text-slate-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    {section.title}
                  </a>
                  <button 
                    onClick={() => onToggleBookmark(slugify(section.title))}
                    aria-label={`Remove bookmark for ${section.title}`}
                    className="p-1 -mr-1 rounded-full text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      )}

      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        جدول المحتويات
      </h2>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="اقفز إلى قسم..."
          value={jumpQuery}
          onChange={(e) => setJumpQuery(e.target.value)}
          className="w-full pl-3 pr-10 py-2 bg-slate-100 border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          aria-label="Jump to section"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </div>
      </div>
      <nav aria-label="Table of contents">
        <ol className="space-y-2">
          {filteredTocSections.map((section) => (
            <li key={section.title}>
              <a
                href={`#${slugify(section.title)}`}
                className="block text-sm text-slate-600 hover:text-blue-600 transition-colors duration-200"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default TableOfContents;