
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ContentSection from './components/ContentSection';
import TableOfContents from './components/TableOfContents';
import SettingsPanel from './components/SettingsPanel';
import { introduction, sections } from './data/content';

type FontSize = 'base' | 'lg' | 'xl';
type LineHeight = 'normal' | 'relaxed' | 'loose';

const App: React.FC = () => {
  const [fontSize, setFontSize] = useState<FontSize>('lg');
  const [lineHeight, setLineHeight] = useState<LineHeight>('relaxed');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fontSizeClassMap: Record<FontSize, string> = {
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const lineHeightClassMap: Record<LineHeight, string> = {
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  };

  const textClasses = `${fontSizeClassMap[fontSize]} ${lineHeightClassMap[lineHeight]}`;
  
  const lowercasedQuery = searchQuery.toLowerCase().trim();

  const highlightText = (text: string, highlight: string): React.ReactNode => {
    if (!highlight) {
        return text;
    }
    // Escape special characters for regex
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={i} className="bg-amber-400 text-slate-900 px-1 rounded-sm">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
  };

  const filteredSections = lowercasedQuery === '' ? sections : sections.filter(section => 
    section.title.toLowerCase().includes(lowercasedQuery) ||
    section.points.some(point => point.text.toLowerCase().includes(lowercasedQuery))
  );

  const introductionMatch = lowercasedQuery === '' ||
    introduction.title.toLowerCase().includes(lowercasedQuery) ||
    introduction.paragraphs.some(p => p.toLowerCase().includes(lowercasedQuery)) ||
    introduction.sections.some(s => s.toLowerCase().includes(lowercasedQuery)) ||
    introduction.conclusion.toLowerCase().includes(lowercasedQuery);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-200 flex flex-col">
      <Header 
        onToggleSettings={() => setShowSettings(!showSettings)} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        lineHeight={lineHeight}
        onLineHeightChange={setLineHeight}
      />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10">
          
          <div className="lg:flex lg:gap-12">
            {/* Sidebar for Table of Contents */}
            <aside className="lg:w-1/3 xl:w-1/4">
              <TableOfContents sections={filteredSections} />
            </aside>

            {/* Main Content Column */}
            <div className="flex-1 mt-12 lg:mt-0">
              {/* Introduction Section */}
              {introductionMatch && (
                <div className="mb-12 border-b-2 border-amber-500/30 pb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-amber-400 mb-6">{highlightText(introduction.title, lowercasedQuery)}</h2>
                  <div className={`space-y-4 text-gray-300 ${textClasses}`}>
                    {introduction.paragraphs.map((p, index) => (
                      <p key={index}>{highlightText(p, lowercasedQuery)}</p>
                    ))}
                  </div>
                  <div className={`mt-6 space-y-2 text-gray-300 ${textClasses}`}>
                      {introduction.sections.map((s, index) => (
                          <p key={index} className="pl-4">{highlightText(s, lowercasedQuery)}</p>
                      ))}
                  </div>
                  <p className={`mt-6 text-gray-300 ${textClasses}`}>{highlightText(introduction.conclusion, lowercasedQuery)}</p>
                </div>
              )}
              
              {/* Content Sections */}
              {filteredSections.length > 0 ? (
                <div className="space-y-12">
                  {filteredSections.map((section, index) => (
                    <ContentSection
                      key={index}
                      title={section.title}
                      points={section.points}
                      textClasses={textClasses}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              ) : (
                searchQuery && !introductionMatch && (
                  <div className="text-center py-12 text-gray-400">
                    <h3 className="text-2xl font-bold mb-2">لا توجد نتائج</h3>
                    <p>لم نتمكن من العثور على أي نتائج لبحثك عن "{searchQuery}".</p>
                  </div>
                )
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
