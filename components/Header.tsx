
import React from 'react';
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
    className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
      isActive
        ? 'bg-amber-500 text-slate-900 font-bold shadow-lg'
        : 'bg-slate-700/80 hover:bg-slate-600/90 text-gray-300'
    }`}
  >
    {children}
  </button>
);

const ActionButton: React.FC<{ onClick: () => void; ariaLabel: string; children: React.ReactNode }> = ({ onClick, ariaLabel, children }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className="p-2 sm:p-3 rounded-full bg-slate-700/80 hover:bg-slate-600/90 text-gray-300 hover:text-amber-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
  const currentDoc = documents[activeDocument];

  return (
    <header className="py-6 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-5">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide">
              {currentDoc.title}
            </h1>
            <p className="mt-2 text-base md:text-lg text-amber-400">
              {currentDoc.author}
            </p>
        </div>
        
        <div className="max-w-5xl mx-auto p-2 sm:p-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
                {/* Search Bar: Prioritized on mobile (order-1), centered on desktop (order-2) */}
                <div className="relative w-full lg:flex-1 lg:max-w-md xl:max-w-lg order-1 lg:order-2">
                    <input
                        type="search"
                        placeholder="ابحث..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-4 py-2 sm:py-2.5 pr-10 bg-slate-900/50 border border-slate-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-300 text-sm sm:text-base"
                        aria-label="Search content"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Document Switcher: Second on mobile (order-2), first on desktop (order-1) */}
                <div className="w-full lg:w-auto order-2 lg:order-1">
                  <div className="flex items-center gap-2 lg:justify-start overflow-x-auto pb-2 -mb-2 lg:pb-0 lg:-mb-0 no-scrollbar">
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

                {/* Action Buttons: Always last */}
                <div className="flex items-center gap-2 order-3">
                    <ActionButton onClick={onToggleSettings} ariaLabel="Accessibility settings">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </ActionButton>
                    <ActionButton onClick={onShare} ariaLabel="Share document">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                    </ActionButton>
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
