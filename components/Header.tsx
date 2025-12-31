
import React, { useState, useEffect, useRef } from 'react';
import { DocumentType, Theme } from '../types';
import Logo from './assets/Logo';

interface HeaderProps {
  onToggleSettings: () => void;
  onToggleToc: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeDocument: DocumentType;
  onDocumentChange: (doc: DocumentType) => void;
  documents: any;
  theme: Theme;
  onToggleTheme: () => void;
}

const ActionButton: React.FC<{ onClick: () => void; ariaLabel: string; children: React.ReactNode; className?: string; disabled?: boolean; }> = ({ onClick, ariaLabel, children, className = '', disabled = false }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`p-2 rounded-full text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--background-tertiary))] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background-primary))] focus:ring-[rgb(var(--ring))] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

const SunIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const Header: React.FC<HeaderProps> = ({ 
  onToggleSettings, 
  onToggleToc,
  searchQuery, 
  onSearchChange, 
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
      if (
        isSearchVisible &&
        searchContainerRef.current && 
        !searchContainerRef.current.contains(target)
      ) {
        setIsSearchVisible(false);
      }
      if (
        isNavOpen &&
        navRef.current &&
        !navRef.current.contains(target)
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
    <header className="py-2 sm:py-3 bg-[rgb(var(--background-secondary)/0.8)] border-b border-[rgb(var(--border-primary))] sticky top-0 z-30 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Side: Mobile Menu Toggle + Logo */}
            <div className="flex items-center gap-1 sm:gap-2">
                <button 
                    onClick={onToggleToc}
                    className="p-2 -ml-2 rounded-full text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--background-tertiary))] lg:hidden transition-colors"
                    aria-label="Open navigation menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <Logo />
            </div>

            {/* Center: Title (Responsive truncation) */}
            <div className={`flex-1 min-w-0 px-2 text-center transition-opacity duration-300 ${isSearchVisible ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-[rgb(var(--text-primary))] truncate max-w-[150px] sm:max-w-[250px] md:max-w-none mx-auto">
                    {currentDoc.title}
                </h1>
                <p className="hidden sm:block text-[10px] sm:text-xs text-[rgb(var(--text-tertiary))] truncate">
                    {currentDoc.author}
                </p>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
                {/* Search Bar Container */}
                <div ref={searchContainerRef} className={`flex items-center transition-all duration-300 ${isSearchVisible ? 'absolute inset-x-0 mx-4 md:relative md:inset-auto md:mx-0 w-[calc(100%-2rem)] md:w-64 lg:w-80' : 'w-auto'}`}>
                    <div className={`relative w-full ${!isSearchVisible ? 'hidden' : 'block'}`}>
                        <input
                            ref={searchInputRef}
                            type="search"
                            placeholder="ابحث..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-4 pr-10 py-1.5 sm:py-2 bg-[rgb(var(--background-tertiary))] border border-[rgb(var(--border-primary))] rounded-full text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-[rgb(var(--ring))] transition-all duration-200 text-sm"
                            aria-label="Search content"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[rgb(var(--text-tertiary))]" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                            </svg>
                        </div>
                    </div>
                    
                    <ActionButton 
                        onClick={() => setIsSearchVisible(prev => !prev)} 
                        ariaLabel="Search document"
                        className={isSearchVisible ? 'hidden md:flex' : ''}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                        </svg>
                    </ActionButton>
                </div>

                <div className={`flex items-center gap-0.5 sm:gap-1 transition-opacity duration-300 ${isSearchVisible ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto' : 'opacity-100'}`}>
                    <ActionButton onClick={onToggleTheme} ariaLabel={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                        {isDarkMode ? <SunIcon /> : <MoonIcon />}
                    </ActionButton>
                    <ActionButton onClick={onToggleSettings} ariaLabel="Accessibility settings">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                        </svg>
                    </ActionButton>
                    
                    {/* Desktop Document Switcher */}
                    <div ref={navRef} className="relative hidden lg:block">
                        <button
                            onClick={() => setIsNavOpen(prev => !prev)}
                            aria-label="Switch document"
                            aria-haspopup="true"
                            aria-expanded={isNavOpen}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[rgb(var(--text-secondary))] bg-[rgb(var(--background-tertiary))] hover:bg-[rgb(var(--border-primary))] rounded-md transition-colors"
                        >
                            <span>{currentDoc.buttonLabel}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-[rgb(var(--text-tertiary))] transition-transform duration-200 ${isNavOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <div 
                            id="document-navigation-menu"
                            className={`absolute top-full right-0 mt-2 w-72 sm:w-80 bg-[rgb(var(--background-secondary))] rounded-lg shadow-xl border border-[rgb(var(--border-primary))] py-2 z-40 transition-all duration-200 ease-out origin-top-right ${isNavOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                            role="menu"
                        >
                            <div className="px-3 py-2 text-xs font-semibold text-[rgb(var(--text-tertiary))] uppercase tracking-wider">
                              اختر وثيقة
                            </div>
                            <ul role="none">
                              {(Object.keys(documents) as DocumentType[]).map((docKey) => (
                                <li key={docKey} role="none">
                                  <button
                                    onClick={() => handleDocChange(docKey)}
                                    className={`w-full text-right px-4 py-2.5 text-sm transition-colors duration-200 flex justify-between items-center ${
                                      activeDocument === docKey
                                        ? 'bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary))] font-semibold'
                                        : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--background-tertiary))]'
                                    }`}
                                    role="menuitem"
                                  >
                                    <div className="flex flex-col text-right">
                                      <span className="font-medium">{documents[docKey].title}</span>
                                      <span className={`text-xs ${activeDocument === docKey ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-tertiary))]'}`}>{documents[docKey].buttonLabel}</span>
                                    </div>
                                    {activeDocument === docKey && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgb(var(--primary))]" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    )}
                                  </button>
                                </li>
                              ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
