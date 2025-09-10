import React from 'react';
import type { Section } from './data/content';
// DEFERRED: import { GoogleGenAI, Type } from "@google/genai";

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
 * It also handles markdown-style bolding (**text**).
 * @param text The text to search within.
 * @param highlight The term to highlight.
 * @returns A React Node with the highlighted and formatted text.
 */
// FIX: Replaced JSX syntax with React.createElement to resolve TypeScript errors in a .ts file.
export const highlightText = (text: string, highlight: string): React.ReactNode => {
    // Split by bold markdown: **text**
    const boldRegex = /(\*\*.*?\*\*)/g;
    const textParts = text.split(boldRegex);

    return textParts.map((part, index) => {
        if (!part) return null;
        
        const isBold = part.startsWith('**') && part.endsWith('**');
        const content = isBold ? part.slice(2, -2) : part;

        const lowercasedHighlight = highlight.toLowerCase().trim();
        if (!lowercasedHighlight) {
            return isBold ? React.createElement('strong', { key: index }, content) : content;
        }

        const regex = getHighlightRegex(lowercasedHighlight);
        const highlightParts = content.split(regex);

        const renderedContent = highlightParts.map((hp, i) =>
            hp.toLowerCase() === lowercasedHighlight ?
                React.createElement('mark', { key: i }, hp)
                :
                hp
        );

        return isBold ? 
            React.createElement('strong', { key: index }, renderedContent) : 
            React.createElement(React.Fragment, { key: index }, renderedContent);
    });
};

// FIX: Lazily initialize AND dynamically import the GoogleGenAI client
// to prevent module-level code from crashing the app on load in a browser environment.
let ai: any; // Use 'any' as type imports are disallowed per guidelines.
const getAiClient = async () => {
    if (!ai) {
        // Dynamically import the module only when needed.
        const { GoogleGenAI } = await import("@google/genai");
        ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    }
    return ai;
}


// Cache for related sections to avoid re-fetching for the same section
const relatedSectionsCache = new Map<string, Promise<string[]>>();

// Queue to manage API requests and avoid rate limiting
let isProcessingQueue = false;
const requestQueue: {
    resolve: (value: string[] | PromiseLike<string[]>) => void;
    reject: (reason?: any) => void;
    currentSection: Section;
    allSections: Section[];
    cacheKey: string;
}[] = [];

async function processQueue() {
    if (isProcessingQueue || requestQueue.length === 0) {
        return;
    }
    isProcessingQueue = true;

    const { resolve, reject, currentSection, allSections, cacheKey } = requestQueue.shift()!;

    try {
        const { Type } = await import("@google/genai");

        const currentSectionContent = [
            currentSection.title,
            ...(currentSection.paragraphs || []),
            ...(currentSection.points ? currentSection.points.map(p => p.text) : [])
        ].join('\n');

        const otherSectionTitles = allSections
            .filter(s => s.title !== currentSection.title)
            .map(s => s.title);

        if (otherSectionTitles.length === 0) {
            resolve([]);
            isProcessingQueue = false;
            processQueue(); // Process next item immediately
            return;
        }
        
        const truncatedContent = currentSectionContent.length > 3000 ? currentSectionContent.substring(0, 3000) + '...' : currentSectionContent;

        const prompt = `
            Based on the semantic meaning and legal context of the following section:
            ---
            Title: ${currentSection.title}
            Content: ${truncatedContent}
            ---
            
            From the list of available section titles below, please identify the top 3 most relevant sections.
            
            Available Titles:
            ${otherSectionTitles.join('; ')}

            Return your answer ONLY as a JSON object with a single key "related_titles" containing an array of strings. Each string must be an exact title from the "Available Titles" list.
            Example: {"related_titles": ["Title 1", "Title 2", "Title 3"]}
        `;

        const genAI = await getAiClient();
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are an expert legal assistant. Your task is to find semantically related legal document sections. You must only return JSON.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        related_titles: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            }
                        },
                        required: ["related_titles"]
                    },
                }
            });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        
        if (result && Array.isArray(result.related_titles)) {
            const validTitles = new Set(otherSectionTitles);
            const relatedTitles = result.related_titles.filter((title: unknown) => typeof title === 'string' && validTitles.has(title));
            resolve(relatedTitles);
        } else {
            resolve([]);
        }

    } catch (error) {
        console.error('Error fetching related sections from Gemini API:', error);
        relatedSectionsCache.delete(cacheKey); // Invalidate cache on error
        reject(error);
    } finally {
        // Add a delay to respect rate limits (e.g., 60 RPM) before processing the next request.
        setTimeout(() => {
            isProcessingQueue = false;
            processQueue(); // Process next item
        }, 1100); // ~55 requests per minute, safely below the limit.
    }
}

/**
 * Finds related sections using the Gemini API based on semantic similarity, with queuing to prevent rate-limiting.
 * @param currentSection The section to find relations for.
 * @param allSections An array of all available sections in the document.
 * @returns A promise that resolves to an array of related section titles.
 */
export const getRelatedSections = (currentSection: Section, allSections: Section[]): Promise<string[]> => {
    const cacheKey = slugify(currentSection.title);
    if (relatedSectionsCache.has(cacheKey)) {
        return relatedSectionsCache.get(cacheKey)!;
    }

    const promise = new Promise<string[]>((resolve, reject) => {
        requestQueue.push({ resolve, reject, currentSection, allSections, cacheKey });
        if (!isProcessingQueue) {
            processQueue();
        }
    });

    relatedSectionsCache.set(cacheKey, promise);
    return promise;
};