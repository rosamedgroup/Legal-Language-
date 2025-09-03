
import React, { useState } from 'react';
import { Section } from '../data/content';

interface TableOfContentsProps {
  sections: Section[];
}

const slugify = (text: string) => {
  return text.trim().replace(/[\s.,;:'()]/g, '-').toLowerCase();
};

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections }) => {
  const [jumpQuery, setJumpQuery] = useState('');

  const filteredTocSections = sections.filter(section => 
    section.title.toLowerCase().includes(jumpQuery.toLowerCase().trim())
  );

  return (
    <div className="lg:sticky lg:top-8 bg-slate-900/30 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-slate-700/50 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <h2 className="text-2xl font-bold text-amber-400 mb-5 border-b-2 border-amber-500/30 pb-3">
        جدول المحتويات
      </h2>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="اقفز إلى قسم..."
          value={jumpQuery}
          onChange={(e) => setJumpQuery(e.target.value)}
          className="w-full pl-4 pr-10 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all duration-300"
          aria-label="Jump to section"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <nav aria-label="Table of contents">
        <ol className="space-y-3">
          {filteredTocSections.map((section) => (
            <li key={section.title}>
              <a
                href={`#${slugify(section.title)}`}
                className="flex items-center text-lg text-gray-300 hover:text-amber-400 transition-colors duration-200 group"
              >
                <span className="ml-3 text-amber-500 group-hover:text-amber-400">&#9679;</span>
                <span>{section.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default TableOfContents;