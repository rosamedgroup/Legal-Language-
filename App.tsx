// FIX: Corrected import statement for useState and useEffect.
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import Header from './components/Header';
import Footer from './components/Footer';
import ContentSection from './components/ContentSection';
import TableOfContents from './components/TableOfContents';
import SettingsPanel from './components/SettingsPanel';
import ShareModal from './components/ShareModal';
import BackToTopButton from './components/BackToTopButton';
import { Section } from './data/content';
import { highlightText, slugify } from './utils';
import { notoKufiArabicFont } from './data/notoKufiArabicFont';

// Static Imports for all documents to ensure stability
import * as enhancementsContent from './data/content';
import * as caseStudyContent from './data/caseStudyContent';
import * as statementOfClaimContent from './data/newCaseContent';
import * as judicialVerdictContent from './data/judicialVerdictContent';

type FontSize = 'base' | 'lg' | 'xl';
type LineHeight = 'normal' | 'relaxed' | 'loose';
export type DocumentType = 'enhancements' | 'caseStudy' | 'statementOfClaim' | 'judicialVerdict';
// FIX: Changed Bookmarks to be a partial record to allow initialization with an empty object and fix type errors.
export type Bookmarks = Partial<Record<DocumentType, string[]>>;

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
    title: 'صك حكم قضائي',
    buttonLabel: 'حكم قضائي',
    author: 'وزارة العدل - المملكة العربية السعودية',
    content: judicialVerdictContent,
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
  const [fontSize, setFontSize] = useState<FontSize>('lg');
  const [lineHeight, setLineHeight] = useState<LineHeight>('relaxed');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState(''); // For immediate input feedback
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState<{ title: string; url: string } | null>(null);
  const [activeDocument, setActiveDocument] = useState<DocumentType>(getInitialDocument());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmarks>({});
  const [selectedSectionsForExport, setSelectedSectionsForExport] = useState<string[]>([]);

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
  
  // Load bookmarks from localStorage on initial render
  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem('legal_drafting_bookmarks');
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    } catch (error)
    {
      console.error("Failed to parse bookmarks from localStorage", error);
      setBookmarks({});
    }
  }, []);

  // When the document changes, select all sections by default for export.
  useEffect(() => {
    const currentDoc = documents[activeDocument];
    const allSectionSlugs = [
      ...(currentDoc.content.introduction.title ? ['introduction'] : []),
      ...currentDoc.content.sections.map(s => slugify(s.title))
    ];
    setSelectedSectionsForExport(allSectionSlugs);
  }, [activeDocument]);


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

  const handleExportPDF = async () => {
    if (selectedSectionsForExport.length === 0) {
        alert("Please select at least one section to export.");
        return;
    }

    setIsGeneratingPDF(true);
    setShowSettings(false);

    // 1. Prepare styles for PDF
    const pdfStyles = document.createElement('style');
    pdfStyles.id = 'pdf-styles';
    pdfStyles.textContent = `
      .pdf-export-container {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
        visibility: hidden;
        width: 800px; /* Provide a fixed width for consistent rendering */
        background-color: #fff !important;
        font-family: 'Amiri', sans-serif;
        direction: rtl;
      }
      .pdf-export-container * {
        font-family: 'Amiri', sans-serif !important;
      }
      .pdf-export-container .text-gray-200,
      .pdf-export-container .text-gray-300,
      .pdf-export-container .text-gray-400 { color: #1e293b !important; }
      .pdf-export-container h2.text-amber-400 { color: #b45309 !important; } /* darker amber */
      .pdf-export-container .text-amber-500 { color: #d97706 !important; }
      .pdf-export-container .border-amber-500 { border-color: #f59e0b !important; }
      .pdf-export-container .border-amber-500\\/30 { border-color: rgba(245, 158, 11, 0.3) !important; }
      .pdf-export-container mark {
        background-color: #fef08a !important; /* yellow-200 */
        color: #1e293b !important;
        padding: 1px 3px !important;
        border-radius: 3px !important;
      }
       .pdf-export-container a {
        color: #2563eb !important;
        text-decoration: none !important;
      }
    `;
    document.head.appendChild(pdfStyles);

    // 2. Clone selected content for PDF generation
    const container = document.createElement('div');
    container.className = 'pdf-export-container';
    
    // --- START: Table of Contents Generation ---
    const currentDoc = documents[activeDocument];
    const allExportableSections = [
        ...(currentDoc.content.introduction.title ? [{ title: currentDoc.content.introduction.title, slug: 'introduction' }] : []),
        ...currentDoc.content.sections.map(s => ({ title: s.title, slug: slugify(s.title) }))
    ];
    
    const selectedSectionDetails = allExportableSections.filter(s => selectedSectionsForExport.includes(s.slug));

    const tocElement = document.createElement('div');
    tocElement.style.marginBottom = '40px';
    tocElement.style.pageBreakAfter = 'always';

    const tocTitleEl = document.createElement('h1');
    tocTitleEl.textContent = 'جدول المحتويات';
    tocTitleEl.style.fontSize = '22pt';
    tocTitleEl.style.fontWeight = 'bold';
    tocTitleEl.style.marginBottom = '20px';
    tocTitleEl.style.paddingBottom = '10px';
    tocTitleEl.style.borderBottom = '2px solid #b45309';

    const tocList = document.createElement('ul');
    tocList.style.listStyle = 'none';
    tocList.style.paddingRight = '0';
    tocList.style.lineHeight = '1.8';

    selectedSectionDetails.forEach(({ title, slug }) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${slug}`;
        link.textContent = title;
        link.style.fontSize = '12pt';
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });
    
    tocElement.appendChild(tocTitleEl);
    tocElement.appendChild(tocList);
    container.appendChild(tocElement);
    // --- END: Table of Contents Generation ---

    if (selectedSectionsForExport.includes('introduction')) {
        const introElement = document.getElementById('introduction-section');
        if (introElement) {
            const introClone = introElement.cloneNode(true) as HTMLElement;
            introClone.id = 'introduction'; // Set ID to match the slug for TOC link
            introClone.style.marginBottom = '40px';
            container.appendChild(introClone);
        }
    }

    const currentSections = documents[activeDocument].content.sections;
    currentSections.forEach(section => {
        const slug = slugify(section.title);
        if (selectedSectionsForExport.includes(slug)) {
            const sectionElement = document.getElementById(slug);
            if (sectionElement) {
                const sectionClone = sectionElement.cloneNode(true) as HTMLElement;
                sectionClone.querySelectorAll('button[aria-label^="Share section"], button[aria-label^="Bookmark"], button[aria-label^="Remove bookmark"]').forEach(btn => {
                    (btn as HTMLElement).style.display = 'none';
                });
                sectionClone.style.marginBottom = '40px';
                container.appendChild(sectionClone);
            }
        }
    });
    
    document.body.appendChild(container);
    
    try {
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4',
            putOnlyUsedFonts: true,
        });

        pdf.addFileToVFS('Amiri-Regular.ttf', notoKufiArabicFont);
        pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
        pdf.setFont('Amiri');

        await pdf.html(container, {
            callback: (doc) => {
                const totalPages = doc.internal.pages.length - 1; // jsPDF 2.x bug, length is pages length + 1
                const documentTitle = documents[activeDocument].title;
                const documentAuthor = documents[activeDocument].author;

                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    doc.setFont('Amiri', 'normal');
                    doc.setTextColor('#64748b');
                    doc.setFontSize(9);
                    
                    doc.text(documentAuthor, 40, 35, { align: 'left', lang: 'ar' } as any);
                    doc.text(documentTitle, doc.internal.pageSize.getWidth() - 40, 35, { align: 'right', lang: 'ar' } as any);

                    const pageStr = `${i} / ${totalPages}`;
                    const pageStrWidth = doc.getStringUnitWidth(pageStr) * doc.getFontSize() / doc.internal.scaleFactor;
                    doc.text(pageStr, doc.internal.pageSize.getWidth() / 2 - pageStrWidth / 2, doc.internal.pageSize.getHeight() - 30);
                }

                const fileName = `${slugify(documentTitle)}.pdf`;
                doc.save(fileName);
            },
            margin: [50, 40, 50, 40],
            autoPaging: 'text',
            width: 515,
            windowWidth: 800,
            fontFaces: [{
                family: 'Amiri',
                style: 'normal',
                weight: 'normal',
                src: [{ url: 'Amiri-Regular.ttf', format: 'truetype' }] 
            }],
            // FIX: Removed the 'dpi' property from html2canvas options as it is deprecated and caused a type error. The 'scale' property is already being used to control the resolution of the generated PDF.
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
            }
        });

    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        document.body.removeChild(container);
        document.head.removeChild(pdfStyles);
        setIsGeneratingPDF(false);
    }
  };


  const handleResetSettings = () => {
    setFontSize('lg');
    setLineHeight('relaxed');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-200 flex flex-col">
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
        isGenerating={isGeneratingPDF}
        onExportPDF={handleExportPDF}
        onResetSettings={handleResetSettings}
        sections={sections}
        introductionTitle={introduction.title}
        selectedSections={selectedSectionsForExport}
        onSelectedSectionsChange={setSelectedSectionsForExport}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        content={shareContent}
      />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10 transition-all ease-in-out duration-300 ${isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
          
            <div id="printable-content" className="lg:flex lg:gap-12">
              <aside className="lg:w-1/3 xl:w-1/4">
                <TableOfContents
                  sections={filteredSections}
                  bookmarkedSections={bookmarkedSections}
                  onToggleBookmark={(slug) => toggleBookmark(activeDocument, slug)}
                />
              </aside>

              <div className="flex-1 mt-12 lg:mt-0">
                  {introductionMatch && introduction.title && (
                    <div id="introduction-section" className="mb-12 border-b-2 border-amber-500/30 pb-8">
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
                          isBookmarked={currentDocBookmarks.includes(slugify(section.title))}
                          onToggleBookmark={() => toggleBookmark(activeDocument, slugify(section.title))}
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
      <BackToTopButton />
    </div>
  );
};

export default App;