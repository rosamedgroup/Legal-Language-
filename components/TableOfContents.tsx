
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
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
  </svg>
);

const BookmarkOutlineIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
  </svg>
);

const ChevronIcon: React.FC<{ isOpen: boolean; className?: string }> = ({ isOpen, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-4 w-4 text-[rgb(var(--text-tertiary))] transform transition-transform duration-300 ${
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
      className={`group flex justify-between items-center gap-1 rounded-lg transition-all duration-150 relative ${
        isActive ? 'bg-[rgba(var(--primary),0.08)]' : ''
      } ${
        isFocused && !isActive ? 'bg-[rgb(var(--background-tertiary))]' : ''
      }`}
    >
      <a
        href={`#${sectionSlug}`}
        onClick={(e) => onLinkClick(e, sectionSlug)}
        tabIndex={-1}
        className={`flex-1 text-[13px] duration-200 py-2 px-3 rounded-lg transition-colors truncate ${
            isActive
            ? 'text-[rgb(var(--primary))] font-bold'
            : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
        }`}
      >
        {displayText || section.title}
      </a>
      <button
        onClick={() => onToggleBookmark(sectionSlug)}
        aria-label={isBookmarked ? `Remove bookmark` : `Bookmark`}
        className={`p-1.5 mr-1 rounded-full transition-all duration-200 ${
            isBookmarked 
            ? 'text-[rgb(var(--primary))]' 
            : 'text-[rgb(var(--text-tertiary))] opacity-0 group-hover:opacity-100 focus:opacity-100'
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
                    if (!parentNode.children.find(c => c.key === node.key)) parentNode.children.push(node);
                } else {
                    if (!rootNodes.find(r => r.key === node.key)) rootNodes.push(node);
                }
            }
            if (index === parts.length - 1) node.section = section;
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
            if (node.children.length > 0) setExpanded(node.children);
        });
    };
    if (tocTree) setExpanded(tocTree);
    setExpandedNodes(initialState);
  }, [tocTree]);

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  };
  
  const flatTocList = useMemo((): FlatTocNode[] | null => {
    if (!tocTree) return null;
    const flatList: FlatTocNode[] = [];
    const traverse = (nodes: TocNode[], level: number) => {
        nodes.forEach(node => {
            flatList.push({ ...node, level });
            if ((expandedNodes[node.key] ?? true) && node.children.length > 0) traverse(node.children, level + 1);
        });
    };
    traverse(tocTree, 0);
    return flatList;
  }, [tocTree, expandedNodes]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
      e.preventDefault();
      setActiveSection(slug);
      const element = document.getElementById(slug);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (history.replaceState && window.location.protocol !== 'blob:') {
          history.replaceState(null, '', `#${slug}`);
        }
      }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const itemCount = (jumpQuery ? filteredTocSections.length : flatTocList?.length ?? 0) + (isBookmarksOpen ? bookmarkedSections.length : 0);
        if (itemCount === 0) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            let newIndex = e.key === 'ArrowDown' ? (focusedIndex + 1) % itemCount : (focusedIndex - 1 + itemCount) % itemCount;
            setFocusedIndex(newIndex);
            const element = itemRefs.current.get(newIndex);
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        if (e.key === 'Enter' && focusedIndex !== -1) {
            e.preventDefault();
            const element = itemRefs.current.get(focusedIndex);
            (element?.querySelector('a') || element?.querySelector('button'))?.click();
        }
    };
    containerRef.current?.addEventListener('keydown', handleKeyDown);
    return () => containerRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, flatTocList, filteredTocSections, jumpQuery, bookmarkedSections.length, isBookmarksOpen]);
  
  useEffect(() => {
      setFocusedIndex(-1);
      itemRefs.current.clear();
  }, [jumpQuery, isBookmarksOpen, flatTocList, sections, bookmarkedSections.length]);

  let itemCounter = 0;
  
  return (
    <div 
        className="h-full flex flex-col focus:outline-none rounded-xl" 
        ref={containerRef} 
        tabIndex={0}
        aria-activedescendant={focusedIndex !== -1 ? `toc-item-${focusedIndex}` : undefined}
    >
      {bookmarkedSections.length > 0 && (
        <div className="mb-6">
           <button
            onClick={() => setIsBookmarksOpen(!isBookmarksOpen)}
            className="w-full flex justify-between items-center px-1 mb-3 group"
            aria-expanded={isBookmarksOpen}
          >
            <h3 className="flex items-center gap-2 text-[11px] text-[rgb(var(--text-tertiary))] uppercase tracking-widest font-bold group-hover:text-[rgb(var(--primary))] transition-colors">
                المفضلة
                <span className="bg-[rgb(var(--background-tertiary))] text-[rgb(var(--text-tertiary))] px-1.5 py-0.5 rounded-full text-[9px]">{bookmarkedSections.length}</span>
            </h3>
            <ChevronIcon isOpen={isBookmarksOpen} />
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isBookmarksOpen ? 'max-h-80' : 'max-h-0'}`}>
              <ol role="listbox" className="space-y-1">
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
                          itemRef={el => { itemRefs.current.set(currentIndex, el); }}
                          id={`toc-item-${currentIndex}`}
                          onLinkClick={handleLinkClick}
                      />
                  );
              })}
              </ol>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="px-1 text-[11px] text-[rgb(var(--text-tertiary))] uppercase tracking-widest font-bold mb-3">
          محتويات الوثيقة
        </h2>
        
        <div className="relative mb-4 group">
          <input
            type="text"
            placeholder="البحث في العناوين..."
            value={jumpQuery}
            onChange={(e) => setJumpQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-[rgb(var(--background-tertiary))] border-transparent rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] focus:bg-[rgb(var(--background-secondary))] focus:ring-2 focus:ring-[rgb(var(--ring))] border border-[rgb(var(--border-primary))] transition-all duration-200 text-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[rgb(var(--text-tertiary))] group-focus-within:text-[rgb(var(--primary))] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>
        </div>
        
        <nav ref={navRef} className="flex-1 overflow-y-auto pr-1 -mr-2 scrollbar-hide">
            {tocTree && flatTocList ? (
                <ol role="listbox" className="space-y-1">
                  {flatTocList.map(node => {
                    const currentIndex = itemCounter++;
                    const hasChildren = node.children.length > 0;
                    const isExpanded = expandedNodes[node.key] ?? true;
                    const isBookmarked = !!node.section && bookmarkedSlugs.has(slugify(node.section.title));
                    const isActive = !!node.section && activeSection === slugify(node.section.title);
                    
                    return (
                        <li 
                            key={node.key}
                            ref={el => { itemRefs.current.set(currentIndex, el); }}
                            id={`toc-item-${currentIndex}`}
                            role="option"
                            aria-selected={currentIndex === focusedIndex}
                            className={`group flex flex-col rounded-lg transition-all duration-150 text-sm relative ${
                                isActive ? 'bg-[rgba(var(--primary),0.08)]' : ''
                            } ${
                                currentIndex === focusedIndex && !isActive ? 'bg-[rgb(var(--background-tertiary))]' : ''
                            }`}
                            style={{ marginRight: `${node.level * 0.5}rem` }}
                        >
                            <div className="flex items-center w-full">
                                {hasChildren ? (
                                    <button onClick={() => toggleNode(node.key)} className="p-1.5 mr-0.5 rounded-lg hover:bg-[rgb(var(--background-tertiary))] transition-colors">
                                        <ChevronIcon isOpen={isExpanded} />
                                    </button>
                                ) : (
                                    <div className="w-5 h-5 flex-shrink-0"></div>
                                )}
                                <a
                                    href={node.section ? `#${slugify(node.section.title)}` : '#'}
                                    onClick={(e) => node.section && handleLinkClick(e, slugify(node.section.title))}
                                    tabIndex={-1}
                                    className={`flex-1 min-w-0 truncate py-2 px-1 rounded-lg transition-colors text-[13px] ${
                                        isActive
                                        ? 'text-[rgb(var(--primary))] font-bold'
                                        : `text-[rgb(var(--text-secondary))] ${!node.section ? 'cursor-default font-semibold text-[rgb(var(--text-primary))]' : 'hover:text-[rgb(var(--text-primary))]'}`
                                    }`}
                                >
                                    {node.title}
                                </a>
                                {node.section && (
                                    <button
                                        onClick={() => onToggleBookmark(slugify(node.section.title))}
                                        className={`p-1.5 ml-1 rounded-full transition-all duration-200 flex-shrink-0 ${
                                            isBookmarked ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-tertiary))] opacity-0 group-hover:opacity-100 focus:opacity-100'
                                        }`}
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
                    <ol role="listbox" className="space-y-1">
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
                                    itemRef={el => { itemRefs.current.set(currentIndex, el); }}
                                    id={`toc-item-${currentIndex}`}
                                    onLinkClick={handleLinkClick}
                                />
                            );
                        })}
                    </ol>
                ) : (
                    <p className="text-xs text-[rgb(var(--text-tertiary))] text-center py-8 italic">
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
