
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
    className={`px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 transform hover:scale-105 ${
      isActive
        ? 'bg-amber-500 text-slate-900 font-bold shadow-lg'
        : 'bg-slate-800/60 hover:bg-slate-700/80 text-gray-300'
    }`}
  >
    {children}
  </button>
);

const docButtonLabels: Record<DocumentType, string> = {
    enhancements: 'محسنات الصياغة',
    caseStudy: 'دراسة حالة',
    statementOfClaim: 'لائحة دعوى',
    judicialVerdict: 'حكم قضائي',
};

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
    <header className="py-8 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/50 relative">
      <div className="container mx-auto text-center px-4">
        
        <div className="flex justify-center flex-wrap gap-2 sm:gap-4 mb-6">
            {(Object.keys(docButtonLabels) as DocumentType[]).map((docKey) => (
                <DocumentButton 
                    key={docKey} 
                    onClick={() => onDocumentChange(docKey)} 
                    isActive={activeDocument === docKey}
                >
                    {docButtonLabels[docKey]}
                </DocumentButton>
            ))}
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-wide">
          {currentDoc.title}
        </h1>
        <p className="mt-4 text-lg md:text-xl text-amber-400">
          {currentDoc.author}
        </p>

        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="search"
              placeholder="ابحث في المحتوى..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-5 py-3 pr-12 bg-slate-800/60 border border-slate-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-300"
              aria-label="Search content"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8">
        <button
          onClick={onToggleSettings}
          aria-label="Accessibility settings"
          className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700/70 text-gray-300 hover:text-amber-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8">
        <button
          onClick={onShare}
          aria-label="Share document"
          className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700/70 text-gray-300 hover:text-amber-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
