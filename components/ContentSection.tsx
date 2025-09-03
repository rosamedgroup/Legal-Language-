import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Point, Section as SectionType } from '../data/content';

// Safely access the API key to prevent ReferenceError in the browser
const API_KEY = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

interface ContentSectionProps {
  title: string;
  points: Point[];
  textClasses: string;
  searchQuery: string;
  onShare: (title: string, slug: string) => void;
  allSections: SectionType[];
}

const slugify = (text: string) => {
  return text.trim().replace(/[\s.,;:'()]/g, '-').toLowerCase();
};

const highlightText = (text: string, highlight: string): React.ReactNode => {
    const lowercasedHighlight = highlight.toLowerCase().trim();
    if (!lowercasedHighlight) {
        return text;
    }
    // Escape special characters for regex
    const escapedHighlight = lowercasedHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === lowercasedHighlight ? (
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

const ContentSection: React.FC<ContentSectionProps> = ({ title, points, textClasses, searchQuery, onShare, allSections }) => {
  const [relatedSections, setRelatedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedSections = async () => {
      if (!API_KEY) {
        console.error("API_KEY is not available. Skipping related sections fetch.");
        setIsLoading(false);
        setRelatedSections([]);
        return;
      }

      setIsLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const otherSectionTitles = allSections
          .filter(s => s.title !== title)
          .map(s => s.title);

        const prompt = `Analyze the following list of legal section titles and identify the 2 or 3 titles that are most logically related to the section "${title}". Return your answer as a JSON object with a single key "related_titles" which is an array of the related titles. The context is a document about legal drafting.\n\nList of all section titles: ${otherSectionTitles.join(', ')}`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        related_titles: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "The title of a related section."
                            },
                            description: "An array of 2-3 related section titles."
                        }
                    }
                }
            },
        });
        
        let jsonString = response.text?.trim();

        if (!jsonString) {
          setRelatedSections([]);
        } else {
          if (jsonString.startsWith("```json")) {
            jsonString = jsonString.slice(7, -3).trim();
          } else if (jsonString.startsWith("```")) {
            jsonString = jsonString.slice(3, -3).trim();
          }
          const result = JSON.parse(jsonString);
          setRelatedSections(result.related_titles || []);
        }

      } catch (error) {
        console.error(`Error fetching related sections for "${title}":`, error);
        setRelatedSections([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedSections();
  }, [title, allSections]);

  return (
    <section id={slugify(title)} className="scroll-mt-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-amber-400 border-r-4 border-amber-500 pr-4">
          {highlightText(title, searchQuery)}
        </h2>
        <button
          onClick={() => onShare(title, slugify(title))}
          aria-label={`Share section: ${title}`}
          className="p-2 -mr-2 rounded-full hover:bg-slate-700/70 text-gray-400 hover:text-amber-400 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>
      </div>
      <ol className="space-y-5">
        {points.map((point) => (
          <li key={point.id} className={`flex items-start ${textClasses}`}>
            <span className="ml-4 text-xl font-bold text-amber-500">{point.id}.</span>
            <span className="flex-1 text-gray-300">{highlightText(point.text, searchQuery)}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8 pt-6 border-t border-slate-700/50">
        <h3 className="text-xl font-semibold text-amber-300 mb-3">
          أقسام ذات صلة
        </h3>
        {isLoading ? (
          <p className="text-gray-400 animate-pulse">جاري البحث عن أقسام ذات صلة...</p>
        ) : relatedSections.length > 0 ? (
          <ul className="space-y-2">
            {relatedSections.map((relatedTitle, index) => (
              <li key={index}>
                <a
                  href={`#${slugify(relatedTitle)}`}
                  className="flex items-center text-gray-300 hover:text-amber-400 transition-colors duration-200 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-amber-500 group-hover:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>{relatedTitle}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          API_KEY && <p className="text-gray-400">لم يتم العثور على أقسام ذات صلة.</p>
        )}
      </div>
    </section>
  );
};

export default ContentSection;