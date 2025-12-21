
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import TableOfContents from './components/TableOfContents';
import SettingsPanel from './components/SettingsPanel';
import BackToTopButton from './components/BackToTopButton';
import { Section } from './data/content';
import { highlightText, slugify } from './utils';
import Placeholder from './components/Placeholder';

// Static Imports for all documents to ensure stability
import * as enhancementsContent from './data/content';
import * as caseStudyContent from './data/caseStudyContent';
import * as statementOfClaimContent from './data/newCaseContent';
import * as newClassificationContent from './data/newClassificationContent';
import * as moralDamagesContent from './data/moralDamagesContent';
import * as criminalJusticeQaContent from './data/criminalJusticeQaContent';
import * as generalJudiciaryQaContent from './data/generalJudiciaryQaContent';
import * as arbitrationAwardsContent from './data/arbitrationAwardsContent';

type FontSize = 'base' | 'lg' | 'xl';
type LineHeight = 'normal' | 'relaxed' | 'loose';
export type Theme = 'light' | 'dark' | 'system';
export type DocumentType = 'enhancements' | 'caseStudy' | 'statementOfClaim' | 'newClassification' | 'moralDamages' | 'criminalJusticeQA' | 'generalJudiciaryQA' | 'arbitrationAwards';
export type Bookmarks = Partial<Record<DocumentType, string[]>>;

interface AppSettings {
  fontSize: FontSize;
  lineHeight: LineHeight;
  theme: Theme;
}

const defaultSettings: AppSettings = {
  fontSize: 'lg',
  lineHeight: 'relaxed',
  theme: 'system',
};

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
  newClassification: {
    title: 'التصنيف الجديد للدعاوى',
    buttonLabel: 'تصنيف الدعاوى',
    author: 'تنسيق: المحامي/ عبد الجميلي | تصنيف: البحوث القانونية عبد الوهاب عبد الحي بن فضل',
    content: newClassificationContent,
  },
  moralDamages: {
    title: 'التعويض عن الضرر المعنوي',
    buttonLabel: 'الضرر المعنوي',
    author: 'د. عبد الملك بن عبد المحسن العسكر',
    content: moralDamagesContent,
  },
  criminalJusticeQA: {
    title: '55 سؤالاً في القضاء الجزائي',
    buttonLabel: 'أسئلة القضاء الجزائي',
    author: 'وزارة العدل',
    content: criminalJusticeQaContent,
  },
  generalJudiciaryQA: {
    title: '60 سؤالاً في القضاء العام',
    buttonLabel: 'أسئلة القضاء العام',
    author: 'وزارة العدل',
    content: generalJudiciaryQaContent,
  },
  arbitrationAwards: {
    title: 'أحكام تحكيم',
    buttonLabel: 'أحكام تحكيم',
    author: 'هيئات تحكيم مختارة',
    content: arbitrationAwardsContent,
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
  const [theme, setTheme] = useState<Theme>(defaultSettings.theme);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState(''); 
  const [activeDocument, setActiveDocument] = useState<DocumentType>(getInitialDocument());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmarks>({});
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('introduction-section');

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveDocument(getInitialDocument());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem('legal_drafting_bookmarks');
      if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));
      const storedSettings = localStorage.getItem('legal_drafting_settings');
      if (storedSettings) {
        const settings: AppSettings = JSON.parse(storedSettings);
        setFontSize(settings.fontSize || defaultSettings.fontSize);
        setLineHeight(settings.lineHeight || defaultSettings.lineHeight);
        setTheme(settings.theme || defaultSettings.theme);
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
  }, []);
  
  useEffect(() => {
    try {
        const settings: AppSettings = { fontSize, lineHeight, theme };
        localStorage.setItem('legal_drafting_settings', JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
  }, [fontSize, lineHeight, theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, [theme]);

  const toggleBookmark = (docId: DocumentType, sectionSlug: string) => {
    setBookmarks(prevBookmarks => {
      const docBookmarks = prevBookmarks[docId] || [];
      const newDocBookmarks = docBookmarks.includes(sectionSlug)
        ? docBookmarks.filter(slug => slug !== sectionSlug)
        : [...docBookmarks, sectionSlug];
      const newBookmarks = { ...prevBookmarks, [docId]: newDocBookmarks };
      localStorage.setItem('legal_drafting_bookmarks', JSON.stringify(newBookmarks));
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
      if (window.location.protocol !== 'blob:') {
        window.history.pushState({ doc }, '', url);
      }
      window.scrollTo(0, 0);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const handleResetSettings = () => {
    setFontSize(defaultSettings.fontSize);
    setLineHeight(defaultSettings.lineHeight);
    setTheme(defaultSettings.theme);
  };

  const handleThemeToggle = () => {
    const isCurrentlyDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isCurrentlyDark ? 'light' : 'dark');
  };

  const currentDocInfo = documents[activeDocument];
  const { introduction, sections } = currentDocInfo.content;

  const textClasses = `${fontSize === 'base' ? 'text-base' : fontSize === 'lg' ? 'text-lg' : 'text-xl'} ${lineHeight === 'normal' ? 'leading-normal' : lineHeight === 'relaxed' ? 'leading-relaxed' : 'leading-loose'}`;
  
  const lowercasedQuery = searchQuery.toLowerCase().trim();

  const getScore = (section: Section, query: string): number => {
    if (!query) return 1;
    let score = 0;
    const lowercasedTitle = section.title.toLowerCase();
    if (lowercasedTitle === query) score += 100;
    else if (lowercasedTitle.includes(query)) score += 50;
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (section.points) section.points.forEach(point => {
        const matches = point.text.toLowerCase().match(regex);
        if (matches) score += matches.length * 5;
    });
    if (section.paragraphs) section.paragraphs.forEach(paragraph => {
        const matches = paragraph.toLowerCase().match(regex);
        if (matches) score += matches.length * 5;
    });
    return score;
  };

  const filteredSections = lowercasedQuery === ''
    ? sections
    : sections
        .map(section => ({ ...section, score: getScore(section, lowercasedQuery) }))
        .filter(section => section.score > 0)
        .sort((a, b) => b.score - a.score);

  const introductionMatch = introduction && (lowercasedQuery === '' ||
    (introduction.title && introduction.title.toLowerCase().includes(lowercasedQuery)) ||
    (introduction.paragraphs && introduction.paragraphs.some(p => p.toLowerCase().includes(lowercasedQuery))));
    
  const currentDocBookmarks = bookmarks[activeDocument] || [];
  const bookmarkedSections = sections.filter(section => currentDocBookmarks.includes(slugify(section.title)));

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('section[id], div[id="introduction-section"]'));
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(entries => {
      const intersectingEntry = [...entries].reverse().find(entry => entry.isIntersecting);
      if (intersectingEntry) setActiveSection(intersectingEntry.target.id);
    }, { rootMargin: '0px 0px -80% 0px' });
    elements.forEach(el => observer.observe(el));
    return () => elements.forEach(el => observer.unobserve(el));
  }, [filteredSections, introductionMatch, activeDocument]);

  useEffect(() => {
    document.body.style.overflow = (isTocOpen && window.innerWidth < 1024) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isTocOpen]);


  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Header 
        onToggleSettings={() => setShowSettings(!showSettings)} 
        onToggleToc={() => setIsTocOpen(!isTocOpen)}
        searchQuery={inputValue}
        onSearchChange={setInputValue}
        activeDocument={activeDocument}
        onDocumentChange={handleDocumentChange}
        documents={documents}
        theme={theme}
        onToggleTheme={handleThemeToggle}
      />
      
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        lineHeight={lineHeight}
        onLineHeightChange={setLineHeight}
        theme={theme}
        onThemeChange={setTheme}
        onResetSettings={handleResetSettings}
      />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex-grow w-full">
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'}`}>
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              
              {/* Mobile TOC Backdrop */}
              <div 
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ease-in-out ${
                  isTocOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsTocOpen(false)}
                aria-hidden={!isTocOpen}
              ></div>

              {/* TOC Sidebar / Off-canvas */}
              <aside className={`
                fixed top-0 right-0 h-full w-80 bg-[rgb(var(--background-secondary))] shadow-2xl z-50 p-5 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) 
                lg:col-span-3 lg:sticky lg:top-24 lg:h-fit lg:w-full lg:p-0 lg:bg-transparent lg:shadow-none lg:max-h-[calc(100vh-6rem)]
                ${isTocOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0
              `}>
                {/* Mobile panel header */}
                <div className="flex justify-between items-center mb-6 lg:hidden">
                    <h2 className="text-xl font-extrabold text-[rgb(var(--text-primary))]">تصفح المحتوى</h2>
                    <button 
                        onClick={() => setIsTocOpen(false)} 
                        className="p-2 -mr-2 rounded-full hover:bg-[rgb(var(--background-tertiary))] text-[rgb(var(--text-secondary))] transition-colors"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col h-full lg:h-auto overflow-hidden">
                    {/* Mobile document selection */}
                    <div className="lg:hidden mb-8 overflow-y-auto">
                        <h3 className="px-1 text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-[0.1em] mb-4">اختر وثيقة</h3>
                        <ul className="space-y-1">
                            {(Object.keys(documents) as DocumentType[]).map((docKey) => (
                            <li key={docKey}>
                                <button
                                    onClick={() => {
                                        handleDocumentChange(docKey);
                                        setIsTocOpen(false);
                                    }}
                                    className={`w-full text-right px-3 py-3 text-sm transition-all duration-200 flex justify-between items-center rounded-xl ${
                                        activeDocument === docKey
                                        ? 'bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary))] font-bold ring-1 ring-[rgba(var(--primary),0.2)]'
                                        : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--background-tertiary))]'
                                    }`}
                                >
                                    <div className="flex flex-col text-right">
                                        <span className="font-semibold">{documents[docKey].title}</span>
                                        <span className={`text-[10px] mt-0.5 ${activeDocument === docKey ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--text-tertiary))]'}`}>{documents[docKey].buttonLabel}</span>
                                    </div>
                                    {activeDocument === docKey && (
                                        <div className="w-2 h-2 rounded-full bg-[rgb(var(--primary))]"></div>
                                    )}
                                </button>
                            </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex-1 overflow-y-auto lg:overflow-visible">
                        <div className="lg:hidden border-t border-[rgb(var(--border-primary))] pt-6 mb-4"></div>
                        <TableOfContents
                            sections={filteredSections}
                            bookmarkedSections={bookmarkedSections}
                            onToggleBookmark={(slug) => toggleBookmark(activeDocument, slug)}
                            activeSection={activeSection}
                            setActiveSection={setActiveSection}
                        />
                    </div>
                </div>
              </aside>

              <article className="lg:col-span-9 w-full min-w-0">
                <div className="bg-[rgb(var(--background-secondary))] p-5 sm:p-8 lg:p-10 rounded-2xl shadow-sm border border-[rgb(var(--border-primary))] overflow-hidden">
                    {introductionMatch && introduction.title && (
                      <div id="introduction-section" className="scroll-mt-24 mb-10 sm:mb-16 border-b border-[rgb(var(--border-secondary))] pb-10">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[rgb(var(--text-primary))] mb-6 leading-tight">
                            {highlightText(introduction.title, lowercasedQuery)}
                        </h2>
                        {introduction.paragraphs && (
                          <div className={`space-y-5 text-[rgb(var(--text-secondary))] ${textClasses}`}>
                            {introduction.paragraphs.map((p, index) => (
                              <p key={index} className="transition-all duration-200">{highlightText(p, lowercasedQuery)}</p>
                            ))}
                          </div>
                        )}
                        {introduction.sections && (
                          <div className={`mt-8 space-y-3 text-[rgb(var(--text-secondary))] ${textClasses} border-r-4 border-[rgb(var(--primary)/0.2)] pr-4`}>
                              {introduction.sections.map((s, index) => (
                                  <p key={index} className="font-medium">{highlightText(s, lowercasedQuery)}</p>
                              ))}
                          </div>
                        )}
                        {introduction.conclusion && (
                          <p className={`mt-8 text-[rgb(var(--text-secondary))] font-medium italic opacity-90 ${textClasses}`}>{highlightText(introduction.conclusion, lowercasedQuery)}</p>
                        )}
                      </div>
                    )}
                    
                    {filteredSections.length > 0 ? (
                      <div className="space-y-16 sm:space-y-20">
                        {filteredSections.map((section) => {
                          const sectionSlug = slugify(section.title);
                          const isBookmarked = currentDocBookmarks.includes(sectionSlug);

                          return (
                            <section key={section.title} id={sectionSlug} className="scroll-mt-24 group/section">
                              <div className="flex justify-between items-start mb-8 sm:mb-10 border-b border-[rgb(var(--border-secondary))] pb-6">
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[rgb(var(--text-primary))] leading-snug">
                                  {highlightText(section.title, searchQuery)}
                                </h2>
                                <button
                                    onClick={() => toggleBookmark(activeDocument, sectionSlug)}
                                    title={isBookmarked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                                    className={`p-2.5 rounded-full transition-all duration-300 ${
                                        isBookmarked 
                                        ? 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))]' 
                                        : 'hover:bg-[rgb(var(--background-tertiary))] text-[rgb(var(--text-tertiary))]'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isBookmarked ? 0 : 2} viewBox="0 0 16 16">
                                        <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
                                    </svg>
                                </button>
                              </div>

                              {section.metadata && (
                                <div className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                    {Object.entries(section.metadata).map(([key, value]) => (
                                      <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                                        <span className="font-bold text-[rgb(var(--text-tertiary))] text-[10px] uppercase tracking-wider">{key}:</span>
                                        <span className="text-[rgb(var(--text-primary))] font-medium sm:text-left">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {section.points && (
                                <ol className="space-y-6 list-none">
                                  {section.points.map((point) => (
                                    <li key={point.id} className={`flex items-start group/point ${textClasses}`}>
                                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[rgb(var(--background-tertiary))] text-[rgb(var(--primary))] font-bold text-sm ml-4 group-hover/point:bg-[rgb(var(--primary))] group-hover/point:text-white transition-colors duration-200">
                                        {point.id}
                                      </span>
                                      <span className="flex-1 text-[rgb(var(--text-secondary))] pt-0.5">{highlightText(point.text, searchQuery)}</span>
                                    </li>
                                  ))}
                                </ol>
                              )}

                              {section.paragraphs && (
                                <div className={`space-y-6 text-[rgb(var(--text-secondary))] ${textClasses}`}>
                                    {section.paragraphs.map((paragraph, index) => (
                                        <p key={index} className="leading-relaxed">{highlightText(paragraph, searchQuery)}</p>
                                    ))}
                                </div>
                              )}
                            </section>
                          )
                        })}
                      </div>
                    ) : (
                      searchQuery && !introductionMatch && (
                        <Placeholder 
                            type="empty" 
                            title="لا توجد نتائج" 
                            message={`لم نتمكن من العثور على أي نتائج لبحثك عن "${searchQuery}". حاول تجربة كلمات مفتاحية أخرى.`} 
                        />
                      )
                    )}
                </div>
              </article>
            </div>
        </div>
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default App;
