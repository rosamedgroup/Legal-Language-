import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Section } from '../data/content';
import { slugify } from '../utils';

interface TableOfContentsProps {
  sections: Section[];
  bookmarkedSections: Section[];
  onToggleBookmark: (slug: string) => void;
  activeSection: string;
}

const BookmarkFilledIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
  </svg>
);

const BookmarkOutlineIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
  </svg>
);

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 text-slate-500 dark:text-slate-400 transform transition-transform duration-300 ${
      isOpen ? 'rotate-180' : 'rotate-0'
    }`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

// A single TOC item component to reduce repetition
const TocItem: React.FC<{
  section: Section;
  activeSection: string;
  isBookmarked: boolean;
  onToggleBookmark: (slug: string) => void;
  displayText?: string;
  isFocused: boolean;
  itemRef: (el: HTMLLIElement | null) => void;
  id: string;
}> = ({ section, activeSection, isBookmarked, onToggleBookmark, displayText, isFocused, itemRef, id }) => {
  const sectionSlug = slugify(section.title);
  const isActive = activeSection === sectionSlug;
  
  return (
    <li
      ref={itemRef}
      id={id}
      role="option"
      aria-selected={isFocused}
      className={`group flex justify-between items-center gap-2 transition-colors duration-150 ${
        isFocused ? 'bg-slate-200/60 dark:bg-slate-700/60 rounded-md' : ''
      }`}
    >
      <a
        href={`#${sectionSlug}`}
        tabIndex={-1} // Items are navigated via arrow keys, not tab
        className={`flex-1 text-sm duration-200 py-1 px-1 rounded-l-md ${
            isActive
            ? 'text-blue-600 font-semibold dark:text-blue-400'
            : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
        }`}
      >
        {displayText || section.title}
      </a>
      <button
        onClick={() => onToggleBookmark(sectionSlug)}
        aria-label={isBookmarked ? `Remove bookmark for ${section.title}` : `Bookmark section ${section.title}`}
        className={`p-1 mr-1 rounded-full transition-all duration-200 ${
            isBookmarked 
            ? 'text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400' 
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 focus:opacity-100'
        }`}
        tabIndex={-1}
      >
        {isBookmarked ? <BookmarkFilledIcon /> : <BookmarkOutlineIcon />}
      </button>
    </li>
  );
};


const TableOfContents: React.FC<TableOfContentsProps> = ({ sections, bookmarkedSections, onToggleBookmark, activeSection }) => {
  const [jumpQuery, setJumpQuery] = useState('');
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLLIElement | null>>(new Map());

  const bookmarkedSlugs = useMemo(() => new Set(bookmarkedSections.map(s => slugify(s.title))), [bookmarkedSections]);
  
  const filteredTocSections = useMemo(() => sections.filter(section => 
    section.title.toLowerCase().includes(jumpQuery.toLowerCase().trim())
  ), [sections, jumpQuery]);
  
  const groupedSections = useMemo(() => {
    if (jumpQuery.trim() !== '') return null; // Don't group when searching

    const groups: Record<string, Section[]> = {};
    sections.forEach(section => {
      const titleParts = section.title.split(/ - |:/);
      const groupTitle = titleParts[0].trim();

      if (!groups[groupTitle]) {
        groups[groupTitle] = [];
      }
      groups[groupTitle].push(section);
    });
    return groups;
  }, [sections, jumpQuery]);
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Default groups to expanded when component mounts or groups change
    const initialExpandedState: Record<string, boolean> = {};
    if (groupedSections) {
      Object.keys(groupedSections).forEach(groupTitle => {
        initialExpandedState[groupTitle] = true;
      });
    }
    setExpandedGroups(initialExpandedState);
  }, [groupedSections]);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };
  
  // This effect handles the keyboard navigation logic.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const itemCount = itemRefs.current.size;
        if (itemCount === 0) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            
            let newIndex = e.key === 'ArrowDown'
                ? (focusedIndex + 1) % itemCount
                : (focusedIndex - 1 + itemCount) % itemCount;

            if (focusedIndex === -1 && e.key === 'ArrowUp') {
              newIndex = itemCount - 1;
            } else if (focusedIndex === -1 && e.key === 'ArrowDown') {
              newIndex = 0;
            }
            
            setFocusedIndex(newIndex);
            
            // Scroll the newly focused item into view.
            const element = itemRefs.current.get(newIndex);
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }

        if (e.key === 'Enter') {
            if (focusedIndex !== -1) {
                e.preventDefault();
                const element = itemRefs.current.get(focusedIndex);
                const link = element?.querySelector('a');
                if (link) {
                  link.click();
                   // Manually update URL hash since click simulation might not
                  const href = link.getAttribute('href');
                  if (href) {
                     window.location.hash = href;
                  }
                }
            }
        }
    };

    const container = containerRef.current;
    if (container) {
        container.addEventListener('keydown', handleKeyDown);
    }
    return () => {
        if (container) {
            container.removeEventListener('keydown', handleKeyDown);
        }
    };
  }, [focusedIndex]);
  
  // Reset focus when search query or other state changes, as the list of items is altered.
  useEffect(() => {
      setFocusedIndex(-1);
      itemRefs.current.clear(); // Clear refs when list re-renders to get a fresh count.
  }, [jumpQuery, isBookmarksOpen, expandedGroups, sections]);

  let itemCounter = 0;
  
  return (
    <div 
        className="h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 rounded-md" 
        ref={containerRef} 
        tabIndex={0}
        aria-activedescendant={focusedIndex !== -1 ? `toc-item-${focusedIndex}` : undefined}
    >
      {bookmarkedSections.length > 0 && (
        <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
           <button
            onClick={() => setIsBookmarksOpen(!isBookmarksOpen)}
            className="w-full flex justify-between items-center text-right font-semibold"
            aria-expanded={isBookmarksOpen}
            aria-controls="bookmarks-list"
          >
            <h3 className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
                </svg>
                المفضلة
            </h3>
            <ChevronIcon isOpen={isBookmarksOpen} />
          </button>
          <div
            id="bookmarks-list"
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isBookmarksOpen ? 'max-h-96 mt-3' : 'max-h-0'
            }`}
          >
            {isBookmarksOpen && (
              <nav aria-label="Bookmarked sections">
                  <ol role="listbox" className="space-y-2 pr-2">
                  {bookmarkedSections.map((section) => {
                      const currentIndex = itemCounter++;
                      return (
                          <TocItem 
                              key={`bookmark-${slugify(section.title)}`}
                              section={section}
                              activeSection={activeSection}
                              isBookmarked={true}
                              onToggleBookmark={onToggleBookmark}
                              isFocused={currentIndex === focusedIndex}
                              itemRef={el => itemRefs.current.set(currentIndex, el)}
                              id={`toc-item-${currentIndex}`}
                          />
                      );
                  })}
                  </ol>
              </nav>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
          جدول المحتويات
        </h2>
        
        <div className="relative my-4">
          <input
          type="text"
          placeholder="اقفز إلى قسم..."
          value={jumpQuery}
          onChange={(e) => setJumpQuery(e.target.value)}
          className="w-full pl-3 pr-10 py-2 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          aria-label="Jump to section"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          </div>
        </div>
        
        <nav aria-label="Table of contents" className="flex-1 overflow-y-auto pr-1 -mr-2">
            {groupedSections ? (
                <ul className="space-y-1">
                    {Object.entries(groupedSections).map(([groupTitle, groupSections]) => {
                        const isExpanded = expandedGroups[groupTitle] ?? false;
                        const isCollapsible = !(groupSections.length === 1 && groupSections[0].title === groupTitle);
                        
                        if (!isCollapsible) {
                            const currentIndex = itemCounter++;
                            return <TocItem 
                                key={groupSections[0].title} 
                                section={groupSections[0]} 
                                onToggleBookmark={onToggleBookmark} 
                                activeSection={activeSection} 
                                isBookmarked={bookmarkedSlugs.has(slugify(groupSections[0].title))} 
                                isFocused={currentIndex === focusedIndex}
                                itemRef={el => itemRefs.current.set(currentIndex, el)}
                                id={`toc-item-${currentIndex}`}
                            />;
                        }

                        return (
                            <li key={groupTitle}>
                                <button onClick={() => toggleGroup(groupTitle)} className="w-full flex justify-between items-center text-right py-1.5 rounded" aria-expanded={isExpanded}>
                                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{groupTitle}</span>
                                    <ChevronIcon isOpen={isExpanded} />
                                </button>
                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                  {isExpanded && (
                                    <ol role="listbox" className="space-y-1.5 pr-3 pt-2 pb-1 border-r border-slate-200 dark:border-slate-700">
                                        {groupSections.map(section => {
                                            const currentIndex = itemCounter++;
                                            return (
                                                <TocItem 
                                                    key={section.title}
                                                    section={section}
                                                    activeSection={activeSection}
                                                    isBookmarked={bookmarkedSlugs.has(slugify(section.title))}
                                                    onToggleBookmark={onToggleBookmark}
                                                    displayText={section.title.replace(groupTitle, '').replace(/^(\s*-\s*|:\s*)/, '')}
                                                    isFocused={currentIndex === focusedIndex}
                                                    itemRef={el => itemRefs.current.set(currentIndex, el)}
                                                    id={`toc-item-${currentIndex}`}
                                                />
                                            );
                                        })}
                                    </ol>
                                  )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <ol role="listbox" className="space-y-2">
                    {filteredTocSections.map(section => {
                        const currentIndex = itemCounter++;
                        return (
                           <TocItem 
                                key={section.title}
                                section={section}
                                activeSection={activeSection}
                                isBookmarked={bookmarkedSlugs.has(slugify(section.title))}
                                onToggleBookmark={onToggleBookmark}
                                isFocused={currentIndex === focusedIndex}
                                itemRef={el => itemRefs.current.set(currentIndex, el)}
                                id={`toc-item-${currentIndex}`}
                            />
                        );
                    })}
                </ol>
            )}
        </nav>
      </div>
    </div>
  );
};

export default TableOfContents;
