
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ContentSection from './components/ContentSection';
import TableOfContents from './components/TableOfContents';
import SettingsPanel from './components/SettingsPanel';
import ShareModal from './components/ShareModal';
import { introduction as enhancementsIntro, sections as enhancementsSections, Section } from './data/content';
import { introduction as caseStudyIntro, sections as caseStudySections } from './data/caseStudyContent';
import { highlightText } from './utils';

type FontSize = 'base' | 'lg' | 'xl';
type LineHeight = 'normal' | 'relaxed' | 'loose';
export type DocumentType = 'enhancements' | 'caseStudy';

const documents = {
  enhancements: {
    title: 'محسنات الصياغة القانونية',
    author: 'جمع وإعداد: د. عبد الله بن محمد الدخيل',
    introduction: enhancementsIntro,
    sections: enhancementsSections,
  },
  caseStudy: {
    title: 'مجموعة الأحكام الإدارية',
    author: 'دراسة حالة قضائية',
    introduction: caseStudyIntro,
    sections: caseStudySections,
  },
};

const App: React.FC = () => {
  const [fontSize, setFontSize] = useState<FontSize>('lg');
  const [lineHeight, setLineHeight] = useState<LineHeight>('relaxed');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState<{ title: string; url: string } | null>(null);
  const [activeDocument, setActiveDocument] = useState<DocumentType>('enhancements');

  const currentDoc = documents[activeDocument];
  const { introduction, sections } = currentDoc;

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
    const url = slug ? `${baseUrl}?doc=${activeDocument}#${slug}` : `${baseUrl}?doc=${activeDocument}`;
    setShareContent({ title, url });
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setShareContent(null);
  };

  const getScore = (section: Section, query: string): number => {
    if (!query) return 1;

    let score = 0;
    const lowercasedTitle = section.title.toLowerCase();

    if (lowercasedTitle === query) score += 100;
    else if (lowercasedTitle.includes(query)) score += 50;

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    
    if (section.points) {
        section.points.forEach(point => {
            const matches = point.text.toLowerCase().match(regex);
            if (matches) score += matches.length * 5;
        });
    }
    if (section.paragraphs) {
        section.paragraphs.forEach(paragraph => {
            const matches = paragraph.toLowerCase().match(regex);
            if (matches) score += matches.length * 5;
        });
    }

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
    (introduction.title && introduction.title.toLowerCase().includes(lowercasedQuery)) ||
    (introduction.paragraphs && introduction.paragraphs.some(p => p.toLowerCase().includes(lowercasedQuery))) ||
    (introduction.sections && introduction.sections.some(s => s.toLowerCase().includes(lowercasedQuery))) ||
    (introduction.conclusion && introduction.conclusion.toLowerCase().includes(lowercasedQuery));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-200 flex flex-col">
      <Header 
        onToggleSettings={() => setShowSettings(!showSettings)} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onShare={() => handleOpenShareModal(currentDoc.title)}
        activeDocument={activeDocument}
        onDocumentChange={setActiveDocument}
        documents={documents}
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
            <aside className="lg:w-1/3 xl:w-1/4">
              <TableOfContents sections={filteredSections} />
            </aside>

            <div className="flex-1 mt-12 lg:mt-0">
              {introductionMatch && introduction.title && (
                <div className="mb-12 border-b-2 border-amber-500/30 pb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-amber-400 mb-6">{highlightText(introduction.title, lowercasedQuery)}</h2>
                  {introduction.paragraphs && (
                    <div className={`space-y-4 text-gray-300 ${textClasses}`}>
                      {introduction.paragraphs.map((p, index) => (
                        <p key={index}>{highlightText(p, lowercasedQuery)}</p>
                      ))}
                    </div>
                  )}
                  {introduction.sections && (
                    <div className={`mt-6 space-y-2 text-gray-300 ${textClasses}`}>
                        {introduction.sections.map((s, index) => (
                            <p key={index} className="pl-4">{highlightText(s, lowercasedQuery)}</p>
                        ))}
                    </div>
                  )}
                  {introduction.conclusion && (
                    <p className={`mt-6 text-gray-300 ${textClasses}`}>{highlightText(introduction.conclusion, lowercasedQuery)}</p>
                  )}
                </div>
              )}
              
              {filteredSections.length > 0 ? (
                <div className="space-y-12">
                  {filteredSections.map((section) => (
                    <ContentSection
                      key={section.title}
                      title={section.title}
                      points={section.points}
                      paragraphs={section.paragraphs}
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
