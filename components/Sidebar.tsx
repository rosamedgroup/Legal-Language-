
import React, { useState } from 'react';
import TableOfContents from './TableOfContents';
import { DocumentType } from '../types';
import { Section } from '../data/content';
import { slugify } from '../utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documents: any;
  activeDocument: DocumentType;
  onDocumentChange: (doc: DocumentType) => void;
  sections: Section[];
  bookmarkedSections: Section[];
  onToggleBookmark: (slug: string) => void;
  activeSection: string;
  setActiveSection: (slug: string) => void;
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const BookmarkFilledIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
  </svg>
);

const CollapsibleSection: React.FC<{
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}> = ({ title, count, children, defaultOpen = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-[rgb(var(--border-secondary))] last:border-0 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 px-2 group focus:outline-none hover:bg-[rgb(var(--background-tertiary))] rounded-lg transition-colors my-1"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))] transition-colors">{title}</span>
            {count !== undefined && count > 0 && (
                <span className="bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {count}
                </span>
            )}
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-[rgb(var(--text-tertiary))] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[60vh] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
        <div className="px-1">
            {children}
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  documents,
  activeDocument,
  onDocumentChange,
  sections,
  bookmarkedSections,
  onToggleBookmark,
  activeSection,
  setActiveSection
}) => {

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
      e.preventDefault();
      if (!slug || slug === '#') return;
      setActiveSection(slug);
      const element = document.getElementById(slug);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (history.replaceState && window.location.protocol !== 'blob:') {
          history.replaceState(null, '', `#${slug}`);
        }
      }
      // On mobile, close sidebar after click
      if (window.innerWidth < 1024) {
          onClose();
      }
  };

  return (
    <>
      {/* Mobile TOC Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      ></div>

      {/* TOC Sidebar / Off-canvas */}
      <aside className={`
        fixed top-0 right-0 h-full w-80 bg-[rgb(var(--background-secondary))] shadow-2xl z-50 p-5 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        lg:col-span-3 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:w-full lg:p-0 lg:bg-transparent lg:shadow-none
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 flex flex-col
      `}>
        {/* Mobile panel header */}
        <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="text-xl font-extrabold text-[rgb(var(--text-primary))]">القائمة</h2>
            <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-[rgb(var(--background-tertiary))] text-[rgb(var(--text-secondary))] transition-colors"
                aria-label="Close menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-[rgb(var(--border-primary))]">
            
            {/* Mobile document selection */}
            <div className="lg:hidden">
                <CollapsibleSection title="الوثائق" defaultOpen={true}>
                    <ul className="space-y-1">
                        {(Object.keys(documents) as DocumentType[]).map((docKey) => (
                        <li key={docKey}>
                            <button
                                onClick={() => {
                                    onDocumentChange(docKey);
                                    onClose();
                                }}
                                className={`w-full text-right px-3 py-2.5 text-sm transition-all duration-200 flex justify-between items-center rounded-lg ${
                                    activeDocument === docKey
                                    ? 'bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary))] font-bold'
                                    : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--background-tertiary))]'
                                }`}
                            >
                                <span className="truncate">{documents[docKey].title}</span>
                                {activeDocument === docKey && (
                                    <div className="w-2 h-2 rounded-full bg-[rgb(var(--primary))] flex-shrink-0"></div>
                                )}
                            </button>
                        </li>
                        ))}
                    </ul>
                </CollapsibleSection>
            </div>

            {/* Bookmarks Section */}
            {bookmarkedSections.length > 0 && (
                <CollapsibleSection title="المفضلة" count={bookmarkedSections.length} defaultOpen={true}>
                    <ul className="space-y-1">
                        {bookmarkedSections.map((section) => {
                            const sectionSlug = slugify(section.title);
                            return (
                                <li key={`bm-${sectionSlug}`} className="flex items-center group rounded-lg hover:bg-[rgb(var(--background-tertiary))] transition-colors">
                                    <a
                                        href={`#${sectionSlug}`}
                                        onClick={(e) => handleLinkClick(e, sectionSlug)}
                                        className="flex-1 py-2 px-3 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] truncate block"
                                    >
                                        {section.title}
                                    </a>
                                    <button
                                        onClick={() => onToggleBookmark(sectionSlug)}
                                        className="p-2 text-[rgb(var(--primary))] hover:text-red-500 transition-colors"
                                        title="إزالة من المفضلة"
                                    >
                                        <BookmarkFilledIcon />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </CollapsibleSection>
            )}

            {/* Table of Contents Section */}
            <CollapsibleSection title="الفهرس" defaultOpen={true} className="border-0">
                <TableOfContents
                    sections={sections}
                    bookmarkedSections={bookmarkedSections}
                    onToggleBookmark={onToggleBookmark}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    onLinkClick={handleLinkClick}
                />
            </CollapsibleSection>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
