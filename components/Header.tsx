import React, { useState, useEffect, useRef } from 'react';
import { DocumentType } from '../App';

interface HeaderProps {
  onToggleSettings: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onShare: () => void;
  activeDocument: DocumentType;
  onDocumentChange: (doc: DocumentType) => void;
  documents: any;
}

const DocumentButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'hover:bg-slate-200/70 text-slate-600'
    }`}
  >
    {children}
  </button>
);

const ActionButton: React.FC<{ onClick: () => void; ariaLabel: string; children: React.ReactNode }> = ({ onClick, ariaLabel, children }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className="p-2 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
        {children}
    </button>
);

const Header: React.FC<HeaderProps> = ({ 
  onToggleSettings, 
  searchQuery, 
  onSearchChange, 
  onShare,
  activeDocument,
  onDocumentChange,
  documents
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentDoc = documents[activeDocument];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const toggleButton = (event.target as HTMLElement).closest('[aria-label="Search document"]');
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node) &&
        !toggleButton
      ) {
        if(isSearchVisible) setIsSearchVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchVisible]);

  useEffect(() => {
    if (isSearchVisible) {
      searchInputRef.current?.focus();
    }
  }, [isSearchVisible]);

  return (
    <header className="py-3 bg-white/80 border-b border-slate-200/80 sticky top-0 z-30 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 truncate">
                {currentDoc.title}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 truncate">
                {currentDoc.author}
              </p>
            </div>
            
            {!isSearchVisible && (
              <div className="hidden md:flex items-center gap-2 bg-slate-100/80 p-1 rounded-lg">
                {(Object.keys(documents) as DocumentType[]).map((docKey) => (
                    <DocumentButton 
                        key={docKey} 
                        onClick={() => onDocumentChange(docKey)} 
                        isActive={activeDocument === docKey}
                    >
                        {documents[docKey].buttonLabel}
                    </DocumentButton>
                ))}
              </div>
            )}
            
            <div ref={searchContainerRef} className={`flex items-center gap-1 transition-all duration-300 ${isSearchVisible ? 'w-full max-w-sm' : 'w-auto'}`}>
              <div className={`relative w-full ${!isSearchVisible ? 'hidden' : 'block'}`}>
                  <input
                      ref={searchInputRef}
                      type="search"
                      placeholder="ابحث..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 bg-slate-100 border border-slate-300 rounded-md text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                      aria-label="Search content"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                      </svg>
                  </div>
              </div>

              <div className="flex items-center gap-1">
                <ActionButton onClick={() => setIsSearchVisible(prev => !prev)} ariaLabel="Search document">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </ActionButton>
                <ActionButton onClick={onToggleSettings} ariaLabel="Accessibility settings">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                    </svg>
                </ActionButton>
                <ActionButton onClick={onShare} ariaLabel="Share document">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                      <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                    </svg>
                </ActionButton>
              </div>
            </div>
        </div>

        <div className="md:hidden flex items-center gap-2 justify-center overflow-x-auto pt-3 mt-3 border-t border-slate-200 no-scrollbar">
            {(Object.keys(documents) as DocumentType[]).map((docKey) => (
                <DocumentButton 
                    key={docKey} 
                    onClick={() => onDocumentChange(docKey)} 
                    isActive={activeDocument === docKey}
                >
                    {documents[docKey].buttonLabel}
                </DocumentButton>
            ))}
        </div>
      </div>
    </header>
  );
};

export default Header;