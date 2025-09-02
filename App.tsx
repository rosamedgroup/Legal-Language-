
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ContentSection from './components/ContentSection';
import { introduction, sections } from './data/content';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-200 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10">
          
          {/* Introduction Section */}
          <div className="mb-12 border-b-2 border-amber-500/30 pb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-400 mb-6">{introduction.title}</h2>
            <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
              {introduction.paragraphs.map((p, index) => (
                <p key={index}>{p}</p>
              ))}
            </div>
            <div className="mt-6 space-y-2 text-lg text-gray-300">
                {introduction.sections.map((s, index) => (
                    <p key={index} className="pl-4">{s}</p>
                ))}
            </div>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed">{introduction.conclusion}</p>
          </div>

          {/* Main Content Sections */}
          <div className="space-y-12">
            {sections.map((section, index) => (
              <ContentSection key={index} title={section.title} points={section.points} />
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
