
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-200 flex flex-col">
      <Header onToggleSettings={() => setShowSettings(!showSettings)} />
      
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
              <TableOfContents sections={sections} />
            </aside>

            {/* Main Content Column */}
            <div className="flex-1 mt-12 lg:mt-0">
              {/* Introduction Section */}
              <div className="mb-12 border-b-2 border-amber-500/30 pb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-amber-400 mb-6">{introduction.title}</h2>
                <div className={`space-y-4 text-gray-300 ${textClasses}`}>
                  {introduction.paragraphs.map((p, index) => (
                    <p key={index}>{p}</p>
                  ))}
                </div>
                <div className={`mt-6 space-y-2 text-gray-300 ${textClasses}`}>
                    {introduction.sections.map((s, index) => (
                        <p key={index} className="pl-4">{s}</p>
                    ))}
                </div>
                <p className={`mt-6 text-gray-300 ${textClasses}`}>{introduction.conclusion}</p>
              </div>
              
              {/* Content Sections */}
              <div className="space-y-12">
                {sections.map((section, index) => (
                  <ContentSection
                    key={index}
                    title={section.title}
                    points={section.points}
                    textClasses={textClasses}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;