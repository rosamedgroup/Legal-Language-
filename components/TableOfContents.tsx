import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Section } from '../data/content';
import { slugify } from '../utils';

interface TableOfContentsProps {
  sections: Section[];
  bookmarkedSections: Section[];
  onToggleBookmark: (slug: string) => void;
  activeSection: string;
  setActiveSection: (slug: string) => void;
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

const ChevronIcon: React.FC<{ isOpen: boolean; className?: string }> = ({ isOpen, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 text-[rgb(var(--text-tertiary))] transform transition-transform duration-300 ${
      isOpen ? 'rotate-180' : 'rotate-0'
    } ${className}`}
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

// A single TOC item component to reduce repetition, used for flat lists (bookmarks, search results)
const TocItem: React.FC<{
  section: Section;
  activeSection: string;
  isBookmarked: boolean;
  onToggleBookmark: (slug: string) => void;
  displayText?: string;
  isFocused: boolean;
  itemRef: (el: HTMLLIElement | null) => void;
  id: string;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => void;
}> = ({ section, activeSection, isBookmarked, onToggleBookmark, displayText, isFocused, itemRef, id, onLinkClick }) => {
  const sectionSlug = slugify(section.title);
  const isActive = activeSection === sectionSlug;
  
  return (
    <li
      ref={itemRef}
      id={id}
      role="option"
      aria-selected={isFocused}
      className={`group flex justify-between items-center gap-2 rounded-md transition-colors duration-150 relative ${
        isActive ? 'bg-[rgba(var(--primary),0.1)]' : ''
      } ${
        isFocused && !isActive ? 'bg-[rgb(var(--background-tertiary))]' : ''
      }`}
    >
      {isActive && <div className="absolute right-0 top-1 bottom-1 w-0.5 bg-[rgb(var(--primary))] rounded-full"></div>}
      <a
        href={`#${sectionSlug}`}
        onClick={(e) => onLinkClick(e, sectionSlug)}
        tabIndex={-1} // Items are navigated via arrow keys, not tab
        className={`flex-1 text-sm duration-200 py-1.5 px-2.5 rounded-md transition-colors ${
            isActive
            ? 'text-[rgb(var(--primary))] font-semibold'
            : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
        }`}
      >
        {displayText || section.title}
      </a>
      <button
        onClick={() => onToggleBookmark(sectionSlug)}
        aria-label={isBookmarked ? `Remove bookmark for ${section.title}` : `Bookmark section ${section.title}`}
        className={`p-1.5 mr-1 rounded-full transition-all duration-200 ${
            isBookmarked 
            ? 'text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))]' 
            : 'text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))] opacity-0 group-hover:opacity-100 focus:opacity-100'
        }`}
        tabIndex={-1}
      >
        {isBookmarked ? <BookmarkFilledIcon /> : <BookmarkOutlineIcon />}
      </button>
    </li>
  );
};

interface TocNode {
    key: string;
    title: string;
    section?: Section;
    children: TocNode[];
}

interface FlatTocNode extends TocNode {
    level: number;
}


const TableOfContents: React.FC<TableOfContentsProps> = ({ sections, bookmarkedSections, onToggleBookmark, activeSection, setActiveSection }) => {
  const [jumpQuery, setJumpQuery] = useState('');
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLLIElement | null>>(new Map());
  const navRef = useRef<HTMLElement>(null);

  const bookmarkedSlugs = useMemo(() => new Set(bookmarkedSections.map(s => slugify(s.title))), [bookmarkedSections]);
  
  const filteredTocSections = useMemo(() => sections.filter(section => 
    section.title.toLowerCase().includes(jumpQuery.toLowerCase().trim())
  ), [sections, jumpQuery]);
  
  const tocTree = useMemo((): TocNode[] | null => {
    if (jumpQuery.trim() !== '') return null;

    const rootNodes: TocNode[] = [];
    const nodeMap = new Map<string, TocNode>();

    sections.forEach(section => {
        const parts = section.title.split(/ - |: /);
        let currentPath = '';
        let parentNode: TocNode | undefined;

        parts.forEach((part, index) => {
            const oldPath = currentPath;
            currentPath = oldPath ? `${oldPath}|${part}` : part;

            let node = nodeMap.get(currentPath);
            if (!node) {
                node = { key: currentPath, title: part, children: [] };
                nodeMap.set(currentPath, node);

                if (parentNode) {
                    if (!parentNode.children.find(c => c.key === node.key)) {
                        parentNode.children.push(node);
                    }
                } else {
                    if (!rootNodes.find(r => r.key === node.key)) {
                        rootNodes.push(node);
                    }
                }
            }

            if (index === parts.length - 1) {
                node.section = section;
            }
            parentNode = node;
        });
    });
    return rootNodes;
  }, [sections, jumpQuery]);
  
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    const setExpanded = (nodes: TocNode[]) => {
        nodes.forEach(node => {
            initialState[node.key] = true;
            if (node.children.length > 0) {
                setExpanded(node.children);
            }
        });
    };
    if (tocTree) {
        setExpanded(tocTree);
    }
    setExpandedNodes(initialState);
  }, [tocTree]);

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  };
  
  const flatTocList = useMemo((): FlatTocNode[] | null => {
    if (!tocTree) return null;
    
    const flatList: FlatTocNode[] = [];
    const traverse = (nodes: TocNode[], level: number) => {
        nodes.forEach(node => {
            flatList.push({ ...node, level });
            if ((expandedNodes[node.key] ?? true) && node.children.length > 0) {
                traverse(node.children, level + 1);
            }
        });
    };
    
    traverse(tocTree, 0);
    return flatList;
  }, [tocTree, expandedNodes]);

  // Smooth scroll handler for TOC links
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
      e.preventDefault();
      setActiveSection(slug); // Instantly highlight the clicked item
      const element = document.getElementById(slug);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        // Update the URL hash without adding to browser history for better UX
        // Prevent replaceState on blob URLs which causes a SecurityError in sandboxed environments
        if (history.replaceState && window.location.protocol !== 'blob:') {
          history.replaceState(null, '', `#${slug}`);
        }
      }
  };

  // This effect handles the keyboard navigation logic.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const itemCount = (jumpQuery ? filteredTocSections.length : flatTocList?.length ?? 0) + bookmarkedSections.length;
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
                } else {
                    const button = element?.querySelector('button');
                    button?.click();
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
  }, [focusedIndex, flatTocList, filteredTocSections, jumpQuery, bookmarkedSections.length]);
  
  // Reset focus when search query or other state changes, as the list of items is altered.
  useEffect(() => {
      setFocusedIndex(-1);
      itemRefs.current.clear(); // Clear refs when list re-renders to get a fresh count.
  }, [jumpQuery, isBookmarksOpen, flatTocList, sections, bookmarkedSections.length]);

  // Scroll active item into view when user scrolls the main content
  useEffect(() => {
    const scrollContainer = navRef.current;
    if (!scrollContainer) return;

    const activeLink = scrollContainer.querySelector(`a[href="#${activeSection}"]`);
    if (!activeLink) return;

    const activeListItem = activeLink.closest('li');
    if (!activeListItem) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const itemRect = activeListItem.getBoundingClientRect();
    
    // Only scroll if the item is not fully visible within the container
    if (itemRect.top < containerRect.top || itemRect.bottom > containerRect.bottom) {
      activeListItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeSection]);

  let itemCounter = 0;
  
  return (
    <div 
        className="h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--background-primary))] rounded-md" 
        ref={containerRef} 
        tabIndex={0}
        aria-activedescendant={focusedIndex !== -1 ? `toc-item-${focusedIndex}` : undefined}
    >
      {bookmarkedSections.length > 0 && (
        <div className="mb-4 pb-4 border-b border-[rgb(var(--border-primary))]">
           <button
            onClick={() => setIsBookmarksOpen(!isBookmarksOpen)}
            className="w-full flex justify-between items-center text-right"
            aria-expanded={isBookmarksOpen}
            aria-controls="bookmarks-list"
          >
            <h3 className="flex items-center gap-2 text-xs text-[rgb(var(--text-tertiary))] uppercase tracking-wider font-semibold">
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
                  <ol role="listbox" className="space-y-1.5 pr-2">
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
                              // FIX: The ref callback should not return a value. Wrapped in braces to ensure a void return type.
                              itemRef={el => { itemRefs.current.set(currentIndex, el); }}
                              id={`toc-item-${currentIndex}`}
                              onLinkClick={handleLinkClick}
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
        <h2 className="text-xs text-[rgb(var(--text-tertiary))] uppercase tracking-wider font-semibold">
          جدول المحتويات
        </h2>
        
        <div className="relative my-4">
          <input
          type="text"
          placeholder="اقفز إلى قسم..."
          value={jumpQuery}
          onChange={(e) => setJumpQuery(e.target.value)}
          className="w-full pl-3 pr-10 py-2 bg-[rgb(var(--background-tertiary))] border-[rgb(var(--border-primary))] rounded-md text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-[rgb(var(--ring))] transition-all duration-200 text-sm"
          aria-label="Jump to section"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgb(var(--text-tertiary))]" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          </div>
        </div>
        
        <nav ref={navRef} aria-label="Table of contents" className="flex-1 overflow-y-auto pr-1 -mr-2">
            {tocTree && flatTocList ? (
                <ol role="listbox" className="space-y-1.5">
                  {flatTocList.map(node => {
                    const currentIndex = itemCounter++;
                    const hasChildren = node.children.length > 0;
                    const isExpanded = expandedNodes[node.key] ?? true;
                    const isBookmarked = !!node.section && bookmarkedSlugs.has(slugify(node.section.title));
                    const isActive = !!node.section && activeSection === slugify(node.section.title);
                    
                    const TreeChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
                        <ChevronIcon isOpen={isOpen} className={isOpen ? '!rotate-180' : ''}/>
                    );

                    return (
                        <li 
                            key={node.key}
                            // FIX: The ref callback should not return a value. Wrapped in braces to ensure a void return type.
                            ref={el => { itemRefs.current.set(currentIndex, el); }}
                            id={`toc-item-${currentIndex}`}
                            role="option"
                            aria-selected={currentIndex === focusedIndex}
                            className={`group flex flex-col justify-between items-start rounded-md transition-colors duration-150 text-sm relative ${
                                isActive ? 'bg-[rgba(var(--primary),0.1)]' : ''
                            } ${
                                currentIndex === focusedIndex && !isActive ? 'bg-[rgb(var(--background-tertiary))]' : ''
                            }`}
                            style={{ paddingRight: `${node.level * 0.75}rem` }}
                        >
                            {isActive && <div className="absolute right-0 top-1 bottom-1 w-0.5 bg-[rgb(var(--primary))] rounded-full"></div>}
                            <div className="flex items-center w-full">
                                {hasChildren ? (
                                    <button onClick={() => toggleNode(node.key)} className="p-1 -mr-1 rounded-full hover:bg-[rgb(var(--background-tertiary))]" aria-label={isExpanded ? 'Collapse section' : 'Expand section'}>
                                        <TreeChevronIcon isOpen={isExpanded} />
                                    </button>
                                ) : (
                                    <div className="w-6 h-6 flex-shrink-0"></div>
                                )}
                                <a
                                    href={node.section ? `#${slugify(node.section.title)}` : '#'}
                                    onClick={(e) => node.section && handleLinkClick(e, slugify(node.section.title))}
                                    tabIndex={-1}
                                    className={`flex-1 min-w-0 truncate py-1.5 px-2 rounded-md transition-colors ${
                                        isActive
                                        ? 'text-[rgb(var(--primary))] font-semibold'
                                        : `text-[rgb(var(--text-secondary))] ${!node.section ? 'cursor-default font-medium text-[rgb(var(--text-primary))]' : 'hover:text-[rgb(var(--text-primary))]'}`
                                    }`}
                                >
                                    {node.title}
                                </a>
                                {node.section && (
                                    <button
                                        onClick={() => onToggleBookmark(slugify(node.section.title))}
                                        aria-label={isBookmarked ? `Remove bookmark for ${node.section.title}` : `Bookmark section ${node.section.title}`}
                                        className={`p-1.5 mr-1 rounded-full transition-all duration-200 flex-shrink-0 ${
                                            isBookmarked 
                                            ? 'text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))]' 
                                            : 'text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))] opacity-0 group-hover:opacity-100 focus:opacity-100'
                                        }`}
                                        tabIndex={-1}
                                    >
                                        {isBookmarked ? <BookmarkFilledIcon /> : <BookmarkOutlineIcon />}
                                    </button>
                                )}
                            </div>
                        </li>
                    )
                  })}
                </ol>
            ) : (
                filteredTocSections.length > 0 ? (
                    <ol role="listbox" className="space-y-1.5">
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
                                    // FIX: The ref callback should not return a value. Wrapped in braces to ensure a void return type.
                                    itemRef={el => { itemRefs.current.set(currentIndex, el); }}
                                    id={`toc-item-${currentIndex}`}
                                    onLinkClick={handleLinkClick}
                                />
                            );
                        })}
                    </ol>
                ) : (
                    <p className="text-sm text-[rgb(var(--text-tertiary))] text-center py-4 px-2">
                        لا توجد أقسام مطابقة.
                    </p>
                )
            )}
        </nav>
      </div>
    </div>
  );
};

export default TableOfContents;