// FIX: Corrected import statement for useState and useEffect.
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import TableOfContents from './components/TableOfContents';
import SettingsPanel from './components/SettingsPanel';
import ShareModal from './components/ShareModal';
import BackToTopButton from './components/BackToTopButton';
import RelatedSections from './components/RelatedSections';
import { Section } from './data/content';
import { highlightText, slugify } from './utils';
import { notoKufiArabicFont } from './data/notoKufiArabicFont';
import Placeholder from './components/Placeholder';

// Static Imports for all documents to ensure stability
import * as enhancementsContent from './data/content';
import * as caseStudyContent from './data/caseStudyContent';
import * as statementOfClaimContent from './data/newCaseContent';
import * as judicialVerdictContent from './data/judicialVerdictContent';
import * as newClassificationContent from './data/newClassificationContent';
import * as moralDamagesContent from './data/moralDamagesContent';
import * as criminalJusticeQaContent from './data/criminalJusticeQaContent';
import * as generalJudiciaryQaContent from './data/generalJudiciaryQaContent';
import * as historicalCasesContent from './data/historicalCasesContent';
import * as legalAnalysisContent from './data/legalAnalysisContent';
import * as courtDecisionsContent from './data/courtDecisionsContent';
import * as arbitrationAwardsContent from './data/arbitrationAwardsContent';

type FontSize = 'base' | 'lg' | 'xl';
type LineHeight = 'normal' | 'relaxed' | 'loose';
export type Theme = 'light' | 'dark' | 'system';
export type DocumentType = 'enhancements' | 'caseStudy' | 'statementOfClaim' | 'judicialVerdict' | 'newClassification' | 'moralDamages' | 'criminalJusticeQA' | 'generalJudiciaryQA' | 'historicalCases' | 'legalAnalysis' | 'courtDecisions' | 'arbitrationAwards';
// FIX: Changed Bookmarks to be a partial record to allow initialization with an empty object and fix type errors.
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
    title: 'شكاوى ودعاوى كيدية',
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
  historicalCases: {
    title: 'قضايا تاريخية',
    buttonLabel: 'قضايا تاريخية',
    author: 'مجموعة مختارة',
    content: historicalCasesContent,
  },
  legalAnalysis: {
    title: 'تحليلات قانونية',
    buttonLabel: 'تحليلات قانونية',
    author: 'خبراء قانونيون',
    content: legalAnalysisContent,
  },
  courtDecisions: {
    title: 'قرارات محاكم',
    buttonLabel: 'قرارات محاكم',
    author: 'مجموعة مختارة من المحاكم',
    content: courtDecisionsContent,
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
  const [inputValue, setInputValue] = useState(''); // For immediate input feedback
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState<{ title: string; url: string } | null>(null);
  const [activeDocument, setActiveDocument] = useState<DocumentType>(getInitialDocument());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmarks>({});
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('introduction-section');

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
        setTheme(settings.theme || defaultSettings.theme);
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
  }, []);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
        const settings: AppSettings = { fontSize, lineHeight, theme };
        localStorage.setItem('legal_drafting_settings', JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
  }, [fontSize, lineHeight, theme]);

  // Handle theme changes by applying class to <html>
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        root.classList.toggle('dark', e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

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
    setTheme(defaultSettings.theme);
  };

  const handleThemeToggle = () => {
    const isCurrentlyDark = theme === 'dark' || 
                           (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isCurrentlyDark ? 'light' : 'dark');
  };

  const handlePrintToPdf = async () => {
    const { jsPDF } = (window as any).jspdf;
    const html2canvas = (window as any).html2canvas;
    const contentToPrint = document.querySelector('article > div');
    
    if (!contentToPrint || !html2canvas || !jsPDF) {
        console.error("Required libraries or content for PDF generation not found!");
        return;
    }

    setIsPrinting(true);

    const style = document.createElement('style');
    style.id = 'print-font-style';
    // Using Amiri font from notoKufiArabicFont.ts to ensure it's loaded and doesn't corrupt canvas
    style.innerHTML = `
      @font-face {
        font-family: 'Amiri';
        src: url(data:application/font-ttf;charset=utf-8;base64,${notoKufiArabicFont}) format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      .printing-content * {
        font-family: 'Amiri', sans-serif !important;
      }
    `;
    document.head.appendChild(style);
    (contentToPrint as HTMLElement).classList.add('printing-content');

    const backToTopButton = document.querySelector('.back-to-top-button') as HTMLElement;
    if (backToTopButton) backToTopButton.style.display = 'none';

    // Brief delay to ensure font is applied before canvas capture
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const canvas = await html2canvas(contentToPrint as HTMLElement, {
            scale: 2, // Keep higher scale for better quality
            useCORS: true,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#18181b' : '#ffffff', // zinc-900
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        const margin = 15;
        const effectiveWidth = pdfWidth - (margin * 2);
        const ratio = canvasWidth / effectiveWidth;
        const effectiveHeight = canvasHeight / ratio;
        
        let heightLeft = effectiveHeight;
        let position = 0;
        const pageUsableHeight = pdfHeight - (margin * 2);
        
        // Add the first page
        pdf.addImage(imgData, 'PNG', margin, position + margin, effectiveWidth, effectiveHeight);
        heightLeft -= pageUsableHeight;
        
        // Add subsequent pages
        while (heightLeft > 0) {
            position -= pageUsableHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position + margin, effectiveWidth, effectiveHeight);
            heightLeft -= pageUsableHeight;
        }

        const filename = `${documents[activeDocument].title}.pdf`;
        pdf.save(filename);

    } catch (error) {
        console.error("Failed to generate PDF", error);
        alert("Sorry, there was an error creating the PDF. Please try again.");
    } finally {
        if (backToTopButton) backToTopButton.style.display = '';
        // Cleanup
        (contentToPrint as HTMLElement).classList.remove('printing-content');
        const styleElement = document.getElementById('print-font-style');
        if (styleElement) {
            styleElement.remove();
        }
        setIsPrinting(false);
    }
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

  // IntersectionObserver to track active section for TOC highlighting
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll('section[id], div[id="introduction-section"]')
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersectingEntry = [...entries]
          .reverse()
          .find((entry) => entry.isIntersecting);

        if (intersectingEntry) {
          setActiveSection(intersectingEntry.target.id);
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -80% 0px', // Highlights when the section is in the top 20% of the screen
        threshold: 0,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
    };
  }, [filteredSections, introductionMatch, activeDocument]);

  // Handle body scroll lock when mobile TOC is open
  useEffect(() => {
    const handleScrollLock = () => {
        // Tailwind's 'lg' breakpoint is 1024px
        if (isTocOpen && window.innerWidth < 1024) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    handleScrollLock(); // Apply on mount and when isTocOpen changes

    window.addEventListener('resize', handleScrollLock);

    return () => {
        window.removeEventListener('resize', handleScrollLock);
        document.body.style.overflow = ''; // Always clean up
    };
  }, [isTocOpen]);


  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 flex flex-col">
      <Header 
        onToggleSettings={() => setShowSettings(!showSettings)} 
        onToggleToc={() => setIsTocOpen(!isTocOpen)}
        searchQuery={inputValue}
        onSearchChange={setInputValue}
        onShare={() => handleOpenShareModal(currentDocInfo.title)}
        onPrint={handlePrintToPdf}
        isPrinting={isPrinting}
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

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        content={shareContent}
      />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div id="printable-content" className="lg:flex lg:gap-8">
              
              {/* Mobile TOC Backdrop */}
              {isTocOpen && (
                <div 
                  className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                  onClick={() => setIsTocOpen(false)}
                  aria-hidden="true"
                ></div>
              )}

              {/* TOC Sidebar / Off-canvas */}
              <aside className={`
                fixed top-0 right-0 h-full w-72 bg-zinc-50 dark:bg-zinc-800 shadow-lg z-50 p-4 transition-transform duration-300 ease-in-out 
                lg:sticky lg:top-24 lg:w-64 lg:p-0 lg:pr-4 lg:bg-transparent dark:lg:bg-transparent lg:shadow-none lg:max-h-[calc(100vh-6rem)]
                ${isTocOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0
              `}>
                {/* Mobile panel header */}
                <div className="flex justify-between items-center mb-4 lg:hidden">
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">القائمة</h2>
                    <button 
                        onClick={() => setIsTocOpen(false)} 
                        className="p-2 -mr-2 rounded-full hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-600 dark:text-zinc-300" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>

                {/* Mobile simplified menu */}
                <div className="lg:hidden h-[calc(100%-4rem)] overflow-y-auto">
                    <div className="space-y-8">
                        <div>
                            <h3 className="px-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">اختر وثيقة</h3>
                            <ul className="space-y-1">
                                {(Object.keys(documents) as DocumentType[]).map((docKey) => (
                                <li key={docKey}>
                                    <button
                                        onClick={() => {
                                            handleDocumentChange(docKey);
                                            setIsTocOpen(false); // Close panel on selection
                                        }}
                                        className={`w-full text-right px-3 py-2 text-sm transition-colors duration-200 flex justify-between items-center rounded-md ${
                                            activeDocument === docKey
                                            ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 font-semibold'
                                            : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        <div className="flex flex-col text-right">
                                            <span className="font-medium">{documents[docKey].title}</span>
                                            <span className={`text-xs ${activeDocument === docKey ? 'text-sky-600 dark:text-sky-400' : 'text-zinc-500 dark:text-zinc-400'}`}>{documents[docKey].buttonLabel}</span>
                                        </div>
                                        {activeDocument === docKey && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600 dark:text-sky-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        )}
                                    </button>
                                </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
                             <h3 className="px-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">جدول المحتويات</h3>
                            <TableOfContents
                                sections={filteredSections}
                                bookmarkedSections={bookmarkedSections}
                                onToggleBookmark={(slug) => toggleBookmark(activeDocument, slug)}
                                activeSection={activeSection}
                                setActiveSection={setActiveSection}
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop TOC view */}
                <div className="hidden lg:block h-full">
                    <TableOfContents
                    sections={filteredSections}
                    bookmarkedSections={bookmarkedSections}
                    onToggleBookmark={(slug) => toggleBookmark(activeDocument, slug)}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    />
                </div>

              </aside>

              <article className="flex-1 w-full min-w-0">
                <div className="bg-white dark:bg-zinc-800/50 p-6 md:p-8 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                    {introductionMatch && introduction.title && (
                      <div id="introduction-section" className="scroll-mt-24 mb-12 border-b border-zinc-200 dark:border-zinc-700 pb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">{highlightText(introduction.title, lowercasedQuery)}</h2>
                        {introduction.paragraphs && (
                          <div className={`space-y-4 text-zinc-700 dark:text-zinc-300 ${textClasses}`}>
                            {introduction.paragraphs.map((p, index) => (
                              <p key={index}>{highlightText(p, lowercasedQuery)}</p>
                            ))}
                          </div>
                        )}
                        {introduction.sections && (
                          <div className={`mt-6 space-y-2 text-zinc-700 dark:text-zinc-300 ${textClasses}`}>
                              {introduction.sections.map((s, index) => (
                                  <p key={index} className="pl-4">{highlightText(s, lowercasedQuery)}</p>
                              ))}
                          </div>
                        )}
                        {introduction.conclusion && (
                          <p className={`mt-6 text-zinc-700 dark:text-zinc-300 ${textClasses}`}>{highlightText(introduction.conclusion, lowercasedQuery)}</p>
                        )}
                      </div>
                    )}
                    
                    {filteredSections.length > 0 ? (
                      <div className="space-y-12">
                        {filteredSections.map((section) => {
                          const sectionSlug = slugify(section.title);
                          const isBookmarked = currentDocBookmarks.includes(sectionSlug);

                          return (
                            <section key={section.title} id={sectionSlug} className="scroll-mt-24">
                              <div className="flex justify-between items-start mb-6 border-b border-zinc-200 dark:border-zinc-700 pb-5">
                                <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                                  {highlightText(section.title, searchQuery)}
                                </h2>
                                <div className="flex items-center gap-1 -mr-2">
                                  <button
                                    onClick={() => toggleBookmark(activeDocument, sectionSlug)}
                                    aria-label={isBookmarked ? `Remove bookmark for section: ${section.title}` : `Bookmark section: ${section.title}`}
                                    title={isBookmarked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                                    className="p-2 rounded-full hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400 transition-colors duration-200"
                                  >
                                    {isBookmarked ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600 dark:text-sky-500" fill="currentColor" viewBox="0 0 16 16">
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
                                    title="مشاركة القسم"
                                    className="p-2 rounded-full hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400 transition-colors duration-200"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                                        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              {section.metadata && (
                                <div className="mb-6 bg-zinc-50/70 dark:bg-zinc-700/30 p-4 rounded-lg border border-zinc-200 dark:border-zinc-600/50">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    {Object.entries(section.metadata).map(([key, value]) => (
                                      <React.Fragment key={key}>
                                        <div className="font-semibold text-zinc-600 dark:text-zinc-300">{key}</div>
                                        <div className="text-zinc-800 dark:text-zinc-200">{value}</div>
                                      </React.Fragment>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {section.points && (
                                <ol className="space-y-5">
                                  {section.points.map((point) => (
                                    <li key={point.id} className={`flex items-start ${textClasses}`}>
                                      <span className="ml-4 text-lg font-bold text-zinc-500 dark:text-zinc-400">{point.id}.</span>
                                      <span className="flex-1 text-zinc-700 dark:text-zinc-300">{highlightText(point.text, searchQuery)}</span>
                                    </li>
                                  ))}
                                </ol>
                              )}

                              {section.paragraphs && (
                                <div className={`space-y-5 text-zinc-700 dark:text-zinc-300 ${textClasses}`}>
                                    {section.paragraphs.map((paragraph, index) => (
                                        <p key={index}>{highlightText(paragraph, searchQuery)}</p>
                                    ))}
                                </div>
                              )}

                              <RelatedSections currentSection={section} allSections={sections} />
                              
                            </section>
                          )
                        })}
                      </div>
                    ) : (
                      searchQuery && !introductionMatch && (
                        <Placeholder 
                            type="empty" 
                            title="لا توجد نتائج" 
                            message={`لم نتمكن من العثور على أي نتائج لبحثك عن "${searchQuery}".`} 
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