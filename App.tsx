
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ContentSection from './components/ContentSection';
import TableOfContents from './components/TableOfContents';
import SettingsPanel from './components/SettingsPanel';
import ShareModal from './components/ShareModal';
import { introduction, sections, Section } from './data/content';

type FontSize = 'base' | 'lg' | 'xl';
type LineHeight = 'normal' | 'relaxed' | 'loose';

const App: React.FC = () => {
  const [fontSize, setFontSize] = useState<FontSize>('lg');
  const [lineHeight, setLineHeight] = useState<LineHeight>('relaxed');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState<{ title: string; url: string } | null>(null);

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

  const handleOpenShareModal = (title: string, slug?: string) => {
    const baseUrl = window.location.href.split('#')[0].split('?')[0];
    const url = slug ? `${baseUrl}#${slug}` : baseUrl;
    setShareContent({ title, url });
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setShareContent(null);
  };

  const highlightText = (text: string, highlight: string): React.ReactNode => {
    if (!highlight) {
        return text;
    }
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

  const getScore = (section: Section, query: string): number => {
    if (!query) return 1;

    let score = 0;
    const lowercasedTitle = section.title.toLowerCase();

    // Prioritize exact title match
    if (lowercasedTitle === query) {
      score += 100;
    } 
    // Partial title match
    else if (lowercasedTitle.includes(query)) {
      score += 50;
    }

    // Keyword in points
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    section.points.forEach(point => {
      const matches = point.text.toLowerCase().match(regex);
      if (matches) {
        score += matches.length * 5; // Score based on number of occurrences
      }
    });

    return score;
  };

  const filteredSections = lowercasedQuery === ''
    ? sections
    : sections
        .map(section => ({
          ...section,
          score: getScore(section, lowercasedQuery),
        }))
        .filter(section => section.score > 0)
        .sort((a, b) => b.score - a.score);


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
        onShare={() => handleOpenShareModal('محسنات الصياغة القانونية')}
      />
      
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        lineHeight={lineHeight}
        onLineHeightChange={setLineHeight}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        content={shareContent}
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
                  {filteredSections.map((section) => (
                    <ContentSection
                      key={section.title}
                      title={section.title}
                      points={section.points}
                      textClasses={textClasses}
                      searchQuery={searchQuery}
                      onShare={handleOpenShareModal}
                      allSections={sections}
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