// FIX: Corrected import statement for useState and useEffect.
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import TableOfContents from './components/TableOfContents';
import SettingsPanel from './components/SettingsPanel';
import ShareModal from './components/ShareModal';
import BackToTopButton from './components/BackToTopButton';
import { Section } from './data/content';
import { highlightText, slugify, findRelatedSections } from './utils';

// Static Imports for all documents to ensure stability
import * as enhancementsContent from './data/content';
import * as caseStudyContent from './data/caseStudyContent';
import * as statementOfClaimContent from './data/newCaseContent';
import * as judicialVerdictContent from './data/judicialVerdictContent';
import * as newClassificationContent from './data/newClassificationContent';

type FontSize = 'base' | 'lg' | 'xl';
type LineHeight = 'normal' | 'relaxed' | 'loose';
export type DocumentType = 'enhancements' | 'caseStudy' | 'statementOfClaim' | 'judicialVerdict' | 'newClassification';
// FIX: Changed Bookmarks to be a partial record to allow initialization with an empty object and fix type errors.
export type Bookmarks = Partial<Record<DocumentType, string[]>>;

interface AppSettings {
  fontSize: FontSize;
  lineHeight: LineHeight;
}

const defaultSettings: AppSettings = {
  fontSize: 'lg',
  lineHeight: 'relaxed',
};

interface DocumentContent {
  introduction: any;
  sections: Section[];
}

const documents = {
  enhancements: {
    title: 'محسنات الصياغة القانونية',
    buttonLabel: 'محسنات الصياغة',
    author: 'جمع وإعداد: د. عبد الله بن محمد الدخيل',
    content: enhancementsContent,
  },
  caseStudy: {
    title: 'مجموعة الأحكام الإدارية',
    buttonLabel: 'دراسة حالة',
    author: 'دراسة حالة قضائية',
    content: caseStudyContent,
  },
  statementOfClaim: {
    title: 'لائحة دعوى',
    buttonLabel: 'لائحة دعوى',
    author: 'مقدمة من: المحامية هيفاء بنت فندي الرويلي',
    content: statementOfClaimContent,
  },
  judicialVerdict: {
    title: 'شکاوی ودعاوى كيدية',
    buttonLabel: 'دعاوى كيدية',
    author: 'مجموعة الأحكام القضائية لعام ١٤٣٥هـ',
    content: judicialVerdictContent,
  },
  newClassification: {
    title: 'التصنيف الجديد للدعاوى',
    buttonLabel: 'تصنيف الدعاوى',
    author: 'تنسيق: المحامي/ عبد الجميلي | تصنيف: البحوث القانونية عبد الوهاب عبد الحي بن فضل',
    content: newClassificationContent,
  },
};

const getInitialDocument = (): DocumentType => {
  const params = new URLSearchParams(window.location.search);
  const doc = params.get('doc') as DocumentType;
  if (doc && Object.keys(documents).includes(doc)) {
    return doc;
  }
  return 'enhancements';
};

const App: React.FC = () => {
  const [fontSize, setFontSize] = useState<FontSize>(defaultSettings.fontSize);
  const [lineHeight, setLineHeight] = useState<LineHeight>(defaultSettings.lineHeight);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState(''); // For immediate input feedback
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState<{ title: string; url: string } | null>(null);
  const [activeDocument, setActiveDocument] = useState<DocumentType>(getInitialDocument());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmarks>({});

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300); // Wait 300ms after user stops typing

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveDocument(getInitialDocument());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Load settings and bookmarks from localStorage on initial render
  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem('legal_drafting_bookmarks');
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
      const storedSettings = localStorage.getItem('legal_drafting_settings');
      if (storedSettings) {
        const settings: AppSettings = JSON.parse(storedSettings);
        setFontSize(settings.fontSize || defaultSettings.fontSize);
        setLineHeight(settings.lineHeight || defaultSettings.lineHeight);
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
  }, []);
  
    // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
        const settings: AppSettings = { fontSize, lineHeight };
        localStorage.setItem('legal_drafting_settings', JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
  }, [fontSize, lineHeight]);

  const toggleBookmark = (docId: DocumentType, sectionSlug: string) => {
    setBookmarks(prevBookmarks => {
      const docBookmarks = prevBookmarks[docId] || [];
      const newDocBookmarks = docBookmarks.includes(sectionSlug)
        ? docBookmarks.filter(slug => slug !== sectionSlug)
        : [...docBookmarks, sectionSlug];
      
      const newBookmarks = {
        ...prevBookmarks,
        [docId]: newDocBookmarks,
      };

      try {
        localStorage.setItem('legal_drafting_bookmarks', JSON.stringify(newBookmarks));
      } catch (error) {
        console.error("Failed to save bookmarks to localStorage", error);
      }
      
      return newBookmarks;
    });
  };

  const handleDocumentChange = (doc: DocumentType) => {
    if (doc === activeDocument) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setActiveDocument(doc);
      const url = new URL(window.location.href);
      url.searchParams.set('doc', doc);
      // Prevent pushState on blob URLs which causes a SecurityError in sandboxed environments
      if (window.location.protocol !== 'blob:') {
        window.history.pushState({ doc }, '', url);
      }
      window.scrollTo(0, 0); // Scroll to top on new document
      setTimeout(() => setIsTransitioning(false), 50); // Allow content to render before fading in
    }, 300); // Match this with CSS transition duration
  };

  const handleResetSettings = () => {
    setFontSize(defaultSettings.fontSize);
    setLineHeight(defaultSettings.lineHeight);
  };


  const currentDocInfo = documents[activeDocument];
  const { introduction, sections } = currentDocInfo.content;

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

  const introductionMatch = introduction && (lowercasedQuery === '' ||
    (introduction.title && introduction.title.toLowerCase().includes(lowercasedQuery)) ||
    (introduction.paragraphs && introduction.paragraphs.some(p => p.toLowerCase().includes(lowercasedQuery))) ||
    (introduction.sections && introduction.sections.some(s => s.toLowerCase().includes(lowercasedQuery))) ||
    (introduction.conclusion && introduction.conclusion.toLowerCase().includes(lowercasedQuery)));
    
  // Prepare bookmarked sections for the current document
  const currentDocBookmarks = bookmarks[activeDocument] || [];
  const bookmarkedSections = sections.filter(section => 
    currentDocBookmarks.includes(slugify(section.title))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Header 
        onToggleSettings={() => setShowSettings(!showSettings)} 
        searchQuery={inputValue}
        onSearchChange={setInputValue}
        onShare={() => handleOpenShareModal(currentDocInfo.title)}
        activeDocument={activeDocument}
        onDocumentChange={handleDocumentChange}
        documents={documents}
      />
      
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        lineHeight={lineHeight}
        onLineHeightChange={setLineHeight}
        onResetSettings={handleResetSettings}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        content={shareContent}
      />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div id="printable-content" className="lg:flex lg:gap-8">
              <aside className="lg:w-64">
                <TableOfContents
                  sections={filteredSections}
                  bookmarkedSections={bookmarkedSections}
                  onToggleBookmark={(slug) => toggleBookmark(activeDocument, slug)}
                />
              </aside>

              <div className="flex-1 mt-12 lg:mt-0 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-slate-200/80">
                  {introductionMatch && introduction.title && (
                    <div id="introduction-section" className="mb-12 border-b border-slate-200 pb-8">
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{highlightText(introduction.title, lowercasedQuery)}</h2>
                      {introduction.paragraphs && (
                        <div className={`space-y-4 text-slate-700 ${textClasses}`}>
                          {introduction.paragraphs.map((p, index) => (
                            <p key={index}>{highlightText(p, lowercasedQuery)}</p>
                          ))}
                        </div>
                      )}
                      {introduction.sections && (
                        <div className={`mt-6 space-y-2 text-slate-700 ${textClasses}`}>
                            {introduction.sections.map((s, index) => (
                                <p key={index} className="pl-4">{highlightText(s, lowercasedQuery)}</p>
                            ))}
                        </div>
                      )}
                      {introduction.conclusion && (
                        <p className={`mt-6 text-slate-700 ${textClasses}`}>{highlightText(introduction.conclusion, lowercasedQuery)}</p>
                      )}
                    </div>
                  )}
                  
                  {filteredSections.length > 0 ? (
                    <div className="space-y-12">
                      {filteredSections.map((section) => {
                        const sectionSlug = slugify(section.title);
                        const isBookmarked = currentDocBookmarks.includes(sectionSlug);
                        const relatedSections = findRelatedSections(section.title, sections);

                        return (
                          <section key={section.title} id={sectionSlug} className="scroll-mt-24">
                            <div className="flex justify-between items-start mb-5 border-b border-slate-200 pb-4">
                              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                                {highlightText(section.title, searchQuery)}
                              </h2>
                              <div className="flex items-center gap-1 -mr-2">
                                <button
                                  onClick={() => toggleBookmark(activeDocument, sectionSlug)}
                                  aria-label={isBookmarked ? `Remove bookmark for section: ${section.title}` : `Bookmark section: ${section.title}`}
                                  className="p-2 rounded-full hover:bg-slate-200/60 text-slate-500 transition-colors duration-200"
                                >
                                  {isBookmarked ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 16 16">
                                      <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                                      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
                                    </svg>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleOpenShareModal(section.title, sectionSlug)}
                                  aria-label={`Share section: ${section.title}`}
                                  className="p-2 rounded-full hover:bg-slate-200/60 text-slate-500 transition-colors duration-200"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
                                      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                                      <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            {section.points && (
                              <ol className="space-y-5">
                                {section.points.map((point) => (
                                  <li key={point.id} className={`flex items-start ${textClasses}`}>
                                    <span className="ml-4 text-lg font-bold text-slate-500">{point.id}.</span>
                                    <span className="flex-1 text-slate-700">{highlightText(point.text, searchQuery)}</span>
                                  </li>
                                ))}
                              </ol>
                            )}

                            {section.paragraphs && (
                              <div className={`space-y-5 text-slate-700 ${textClasses}`}>
                                  {section.paragraphs.map((paragraph, index) => (
                                      <p key={index}>{highlightText(paragraph, searchQuery)}</p>
                                  ))}
                              </div>
                            )}

                            {relatedSections.length > 0 && (
                              <div className="mt-8 pt-6 border-t border-slate-200/80 related-sections-container">
                                <h3 className="text-base font-semibold text-slate-800 mb-3">
                                  أقسام ذات صلة
                                </h3>
                                <ul className="space-y-2">
                                  {relatedSections.map((relatedTitle, index) => (
                                    <li key={index}>
                                      <a
                                        href={`#${slugify(relatedTitle)}`}
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 group"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="currentColor" viewBox="0 0 16 16">
                                          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                                          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                                        </svg>
                                        <span>{relatedTitle}</span>
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </section>
                        )
                      })}
                    </div>
                  ) : (
                    searchQuery && !introductionMatch && (
                      <div className="text-center py-12 text-slate-500">
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
      <BackToTopButton />
    </div>
  );
};

export default App;