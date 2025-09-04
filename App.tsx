
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Header from './components/Header';
import Footer from './components/Footer';
import ContentSection from './components/ContentSection';
import TableOfContents from './components/TableOfContents';
import SettingsPanel from './components/SettingsPanel';
import ShareModal from './components/ShareModal';
import BackToTopButton from './components/BackToTopButton';
import { Section } from './data/content';
import { highlightText, slugify } from './utils';

// Static Imports for all documents to ensure stability
import * as enhancementsContent from './data/content';
import * as caseStudyContent from './data/caseStudyContent';
import * as statementOfClaimContent from './data/newCaseContent';
import * as judicialVerdictContent from './data/judicialVerdictContent';

type FontSize = 'base' | 'lg' | 'xl';
type LineHeight = 'normal' | 'relaxed' | 'loose';
export type DocumentType = 'enhancements' | 'caseStudy' | 'statementOfClaim' | 'judicialVerdict';

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
    const contentElement = document.getElementById('printable-content');
    if (!contentElement) {
        console.error("Printable content not found!");
        return;
    }

    setIsGeneratingPDF(true);

    try {
        const canvas = await html2canvas(contentElement, {
            scale: 2, // Use a higher scale for better resolution
            useCORS: true,
            backgroundColor: '#1e293b', // Match the content background (slate-800)
            logging: false, // Suppress html2canvas console logs
            scrollX: 0, // Ensure capture starts from the very top-left
            scrollY: 0,
            windowWidth: contentElement.scrollWidth, // Capture the full width of the content
            windowHeight: contentElement.scrollHeight, // Capture the full height of the content
            onclone: (clonedDoc) => {
                // Hide elements that shouldn't appear in the PDF
                clonedDoc.querySelectorAll('button[aria-label^="Share section"]').forEach(btn => {
                    (btn as HTMLElement).style.visibility = 'hidden';
                });
            }
        });

        const imgData = canvas.toDataURL('image/png', 1.0); // Get image data with full quality
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: 'a4',
            putOnlyUsedFonts: true,
            floatPrecision: 16
        });

        const margin = 40; // 40px margin on all sides
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = pdfWidth - margin * 2;
        const contentHeight = pdfHeight - margin * 2;

        const imgProps = pdf.getImageProperties(imgData);
        // Calculate the scaled image height to maintain aspect ratio within the PDF's content width
        const totalImageHeight = (imgProps.height * contentWidth) / imgProps.width;

        let position = 0; // This will be the negative Y offset for slicing the image
        const totalPages = Math.ceil(totalImageHeight / contentHeight);
        const documentTitle = documents[activeDocument].title;

        // Helper function to add consistent headers and footers to each page
        const addHeaderAndFooter = (pageNumber: number) => {
            pdf.setFontSize(9);
            pdf.setTextColor('#94a3b8'); // Use a theme-consistent color (slate-400)

            // Header: A proper Arabic title would require embedding a compatible font.
            // This uses a generated English title as a robust fallback.
            const englishDocumentTitle = activeDocument.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            pdf.text(englishDocumentTitle, margin, margin / 2, { align: 'left' });

            // Footer: Page numbering
            const pageStr = `Page ${pageNumber} of ${totalPages}`;
            const pageStrWidth = pdf.getStringUnitWidth(pageStr) * pdf.getFontSize() / pdf.internal.scaleFactor;
            pdf.text(pageStr, pdfWidth - margin - pageStrWidth, pdfHeight - margin / 2);
        };

        // Loop to create pages and add slices of the captured image
        for (let i = 1; i <= totalPages; i++) {
            if (i > 1) pdf.addPage();
            // Calculate the negative offset to "move" the image up for each new page
            position = -(contentHeight * (i - 1));
            pdf.addImage(imgData, 'PNG', margin, position + margin, contentWidth, totalImageHeight);
            addHeaderAndFooter(i);
        }
        
        const fileName = `${slugify(documentTitle)}.pdf`;
        pdf.save(fileName);

    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setIsGeneratingPDF(false);
        setShowSettings(false); // Close settings panel after export
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
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        content={shareContent}
      />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10 transition-all ease-in-out duration-300 ${isTransitioning ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
          
            <div className="lg:flex lg:gap-12">
              <aside className="lg:w-1/3 xl:w-1/4">
                <TableOfContents sections={filteredSections} />
              </aside>

              <div id="printable-content" className="flex-1 mt-12 lg:mt-0">
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
      <BackToTopButton />
    </div>
  );
};

export default App;
