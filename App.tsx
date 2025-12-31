
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SettingsPanel from './components/SettingsPanel';
import BackToTopButton from './components/BackToTopButton';
import Sidebar from './components/Sidebar';
import DocumentViewer from './components/DocumentViewer';
import { Section } from './data/content';
import { slugify } from './utils';
import { AppSettings, Bookmarks, DocumentType, FontSize, LineHeight, Theme } from './types';

// Static Imports for all documents to ensure stability
import * as enhancementsContent from './data/content';
import * as caseStudyContent from './data/caseStudyContent';
import * as statementOfClaimContent from './data/newCaseContent';
import * as newClassificationContent from './data/newClassificationContent';
import * as moralDamagesContent from './data/moralDamagesContent';
import * as criminalJusticeQaContent from './data/criminalJusticeQaContent';
import * as generalJudiciaryQaContent from './data/generalJudiciaryQaContent';
import * as arbitrationAwardsContent from './data/arbitrationAwardsContent';

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
    (introduction.paragraphs && introduction.paragraphs.some((p: string) => p.toLowerCase().includes(lowercasedQuery))));
    
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
              
              <Sidebar
                isOpen={isTocOpen}
                onClose={() => setIsTocOpen(false)}
                documents={documents}
                activeDocument={activeDocument}
                onDocumentChange={handleDocumentChange}
                sections={filteredSections}
                bookmarkedSections={bookmarkedSections}
                onToggleBookmark={(slug) => toggleBookmark(activeDocument, slug)}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />

              <DocumentViewer
                activeDocument={activeDocument}
                sections={filteredSections}
                introduction={introduction}
                searchQuery={searchQuery}
                introductionMatch={introductionMatch}
                textClasses={textClasses}
                bookmarks={currentDocBookmarks}
                onToggleBookmark={toggleBookmark}
              />
            </div>
        </div>
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default App;
