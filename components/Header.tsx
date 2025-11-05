import React, { useState, useEffect, useRef } from 'react';
import { DocumentType, Theme } from '../App';

interface HeaderProps {
  onToggleSettings: () => void;
  onToggleToc: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onShare: () => void;
  onPrint: () => void;
  isPrinting: boolean;
  activeDocument: DocumentType;
  onDocumentChange: (doc: DocumentType) => void;
  documents: any;
  theme: Theme;
  onToggleTheme: () => void;
}

const ActionButton: React.FC<{ onClick: () => void; ariaLabel: string; children: React.ReactNode; disabled?: boolean; }> = ({ onClick, ariaLabel, children, disabled = false }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className="p-2 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-700/70 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {children}
    </button>
);

const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

const SunIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);


const Logo: React.FC = () => (
    <a href={window.location.pathname.split('?')[0]} className="flex items-center gap-2 flex-shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md">
         <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            <path d="M12 3v18" />
            <path d="M3 7h18" />
            <path d="M5 7l-2 5h4l-2-5z" />
            <path d="M19 7l-2 5h4l-2-5z" />
        </svg>
      <span className="font-bold text-lg text-slate-800 dark:text-slate-200 hidden sm:inline group-hover:text-slate-900 dark:group-hover:text-white transition-colors">ADL.sa</span>
    </a>
)


const Header: React.FC<HeaderProps> = ({ 
  onToggleSettings, 
  onToggleToc,
  searchQuery, 
  onSearchChange, 
  onShare,
  onPrint,
  isPrinting,
  activeDocument,
  onDocumentChange,
  documents,
  theme,
  onToggleTheme
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentDoc = documents[activeDocument];
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const checkDarkMode = () => {
      setIsDarkMode(theme === 'dark' || (theme === 'system' && mediaQuery.matches));
    };

    checkDarkMode();
    mediaQuery.addEventListener('change', checkDarkMode);
    return () => mediaQuery.removeEventListener('change', checkDarkMode);
  }, [theme]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const searchToggleButton = (event.target as HTMLElement).closest('[aria-label="Search document"]');
      const navToggleButton = (event.target as HTMLElement).closest('[aria-label="Switch document"]');

      if (
        isSearchVisible &&
        searchContainerRef.current && 
        !searchContainerRef.current.contains(target) &&
        !searchToggleButton
      ) {
        setIsSearchVisible(false);
      }
      if (
        isNavOpen &&
        navRef.current &&
        !navRef.current.contains(target) &&
        !navToggleButton
      ) {
        setIsNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchVisible, isNavOpen]);

  useEffect(() => {
    if (isSearchVisible) {
      searchInputRef.current?.focus();
    }
  }, [isSearchVisible]);
  
  const handleDocChange = (docKey: DocumentType) => {
    onDocumentChange(docKey);
    setIsNavOpen(false);
  }

  return (
    <header className="py-3 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-700/80 sticky top-0 z-30 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
            {/* Left Side */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={onToggleToc}
                    className="p-2 -ml-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 lg:hidden"
                    aria-label="Open table of contents"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <Logo />
            </div>

            {/* Center: Title (hidden on small screens) */}
            <div className="flex-1 min-w-0 text-center hidden md:block">
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{currentDoc.title}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentDoc.author}</p>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-1">
                <div ref={searchContainerRef} className={`flex items-center gap-1 transition-all duration-300 ${isSearchVisible ? 'w-full max-w-[14rem] sm:max-w-sm' : 'w-auto'}`}>
                    <div className={`relative w-full ${!isSearchVisible ? 'hidden' : 'block'}`}>
                        <input
                            ref={searchInputRef}
                            type="search"
                            placeholder="ابحث..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                            aria-label="Search content"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                            </svg>
                        </div>
                    </div>
                    
                    <ActionButton onClick={() => setIsSearchVisible(prev => !prev)} ariaLabel="Search document">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                        </svg>
                    </ActionButton>
                </div>

                <ActionButton onClick={onToggleTheme} ariaLabel={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                    {isDarkMode ? <SunIcon /> : <MoonIcon />}
                </ActionButton>

                <ActionButton onClick={onPrint} ariaLabel="Print or export to PDF" disabled={isPrinting}>
                    {isPrinting ? (
                    <SpinnerIcon />
                    ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5 1a2 2 0 0 0-2 2v1H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1H4V3zM2 9.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                    )}
                </ActionButton>
                <ActionButton onClick={onToggleSettings} ariaLabel="Accessibility settings">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                    </svg>
                </ActionButton>
                <ActionButton onClick={onShare} ariaLabel="Share document">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                    </svg>
                </ActionButton>
                
                {/* Document Switcher */}
                <div ref={navRef} className="relative">
                    <ActionButton onClick={() => setIsNavOpen(prev => !prev)} ariaLabel="Switch document">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </ActionButton>

                    {isNavOpen && (
                    <div 
                        id="document-navigation-menu"
                        className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-40"
                        role="menu"
                    >
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          اختر وثيقة
                        </div>
                        <ul role="none">
                          {(Object.keys(documents) as DocumentType[]).map((docKey) => (
                            <li key={docKey} role="none">
                              <button
                                onClick={() => handleDocChange(docKey)}
                                className={`w-full text-right px-4 py-2.5 text-sm transition-colors duration-200 flex justify-between items-center ${
                                  activeDocument === docKey
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-semibold'
                                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                                role="menuitem"
                              >
                                <div className="flex flex-col text-right">
                                  <span className="font-medium">{documents[docKey].title}</span>
                                  <span className={`text-xs ${activeDocument === docKey ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{documents[docKey].buttonLabel}</span>
                                </div>
                                {activeDocument === docKey && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                    </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;