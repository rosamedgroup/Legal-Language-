
import React from 'react';

interface Section {
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
}

const slugify = (text: string) => {
  return text.trim().replace(/[\s.,;:'()]/g, '-').toLowerCase();
};

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections }) => {
  return (
    <div className="lg:sticky lg:top-8 bg-slate-900/30 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-slate-700/50 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <h2 className="text-2xl font-bold text-amber-400 mb-5 border-b-2 border-amber-500/30 pb-3">
        جدول المحتويات
      </h2>
      <nav aria-label="Table of contents">
        <ol className="space-y-3">
          {sections.map((section, index) => (
            <li key={index}>
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