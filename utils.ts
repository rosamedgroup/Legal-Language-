
import React from 'react';
import type { Section } from './data/content';

/**
 * Converts a string into a URL-friendly slug.
 * This version is more robust, removing most non-alphanumeric characters.
 * @param text The text to convert.
 * @returns A URL-friendly slug.
 */
export const slugify = (text: string) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s.,;:'"()]+/g, '-') // Replace spaces and common punctuation with a hyphen
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '') // Remove remaining special characters
    .replace(/--+/g, '-') // Replace multiple hyphens with a single one
    .replace(/^-+/, '') // Trim hyphens from the start
    .replace(/-+$/, ''); // Trim hyphens from the end
};

// Cache for compiled regular expressions to avoid re-creation on every call.
const regexCache = new Map<string, RegExp>();

const getHighlightRegex = (highlight: string): RegExp => {
    if (regexCache.has(highlight)) {
        return regexCache.get(highlight)!;
    }
    // Escape special characters for regex
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    
    // Simple cache eviction to prevent memory leaks in long-running sessions
    if (regexCache.size > 50) {
        const firstKey = regexCache.keys().next().value;
        regexCache.delete(firstKey);
    }
    
    regexCache.set(highlight, regex);
    return regex;
};


/**
 * Highlights a search term within a string by wrapping it in a <mark> tag.
 * @param text The text to search within.
 * @param highlight The term to highlight.
 * @returns A React Node with the highlighted text.
 */
export const highlightText = (text: string, highlight: string): React.ReactNode => {
    const lowercasedHighlight = highlight.toLowerCase().trim();
    if (!lowercasedHighlight) {
        return text;
    }

    const regex = getHighlightRegex(lowercasedHighlight);
    const parts = text.split(regex);
    
    return parts.map((part, i) =>
        part.toLowerCase() === lowercasedHighlight ? (
            React.createElement('mark', {
                key: i,
                className: "bg-amber-400 text-slate-900 px-1 rounded-sm"
            }, part)
        ) : (
            part
        )
    );
};

// A basic list of Arabic stop words to ignore during keyword extraction.
const ARABIC_STOP_WORDS = new Set([
  'في', 'من', 'على', 'إلى', 'عن', 'هو', 'هي', 'هم', 'هن', 'هذا', 'هذه', 'ذلك',
  'أن', 'إن', 'كان', 'قد', 'لا', 'ما', 'أو', 'و', 'ثم', 'حتى', 'لكن', 'إذ', 'إذا',
  'يا', 'أيها', 'الذي', 'التي', 'الذين', 'مع', 'به', 'له', 'منه', 'فيه', 'تم', 'تمت',
  'كل', 'بعض', 'غير', 'سوى', 'عند', 'مثل', 'أي', 'حيث', 'كيف', 'متى', 'يكون',
  'تكون', 'نكون', 'يكونون', 'كانت', 'كنت', 'كنا', 'عليهم', 'إليهم', 'بما', 'كما',
  'فإن', 'وقد', 'ولما', 'وهو', 'وهي', 'أما', 'إلا', 'أنه', 'إذ', 'ذلك', 'لأن',
]);

/**
 * Extracts meaningful keywords from a given text.
 * @param text The input text.
 * @returns A Set of unique keywords.
 */
const getKeywords = (text: string): Set<string> => {
  const words = text
    .replace(/[.,;:'"()]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !ARABIC_STOP_WORDS.has(word));
  return new Set(words);
};

/**
 * Calculates the Jaccard similarity between two sets.
 * @param setA The first set of strings.
 * @param setB The second set of strings.
 * @returns A similarity score between 0 and 1.
 */
const jaccardSimilarity = (setA: Set<string>, setB: Set<string>): number => {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
};

/**
 * Finds related sections based on keyword similarity.
 * @param currentTitle The title of the section to find relations for.
 * @param allSections An array of all available sections.
 * @param count The number of related sections to return.
 * @returns An array of related section titles.
 */
export const findRelatedSections = (currentTitle: string, allSections: Section[], count: number = 3): string[] => {
  const sectionsWithKeywords = allSections.map(section => {
    const pointsText = section.points ? section.points.map(p => p.text).join(' ') : '';
    const paragraphsText = section.paragraphs ? section.paragraphs.join(' ') : '';
    const content = `${section.title} ${pointsText} ${paragraphsText}`;
    return {
      title: section.title,
      keywords: getKeywords(content),
    };
  });

  const currentSectionKeywords = sectionsWithKeywords.find(s => s.title === currentTitle)?.keywords;
  if (!currentSectionKeywords) {
    return [];
  }

  const scoredSections = sectionsWithKeywords
    .filter(section => section.title !== currentTitle)
    .map(section => ({
      title: section.title,
      score: jaccardSimilarity(currentSectionKeywords, section.keywords),
    }))
    .filter(section => section.score > 0.02) // Set a small threshold to avoid completely unrelated matches
    .sort((a, b) => b.score - a.score);

  return scoredSections.slice(0, count).map(s => s.title);
};
