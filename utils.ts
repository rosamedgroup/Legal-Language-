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
const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 15000; // Increased delay to 15s to avoid rate-limiting (~4 RPM).

const requestQueue: {
    resolve: (value: string[] | PromiseLike<string[]>) => void;
    reject: (reason?: any) => void;
    currentSection: Section;
    allSections: Section[];
    cacheKey: string;
    retries: number;
}[] = [];

async function processQueue() {
    if (isProcessingQueue || requestQueue.length === 0) {
        return;
    }
    isProcessingQueue = true;

    const request = requestQueue.shift()!;
    const { resolve, reject, currentSection, allSections, cacheKey, retries } = request;

    // A helper to schedule the next queue processing
    const scheduleNext = (delay: number) => {
        setTimeout(() => {
            isProcessingQueue = false;
            processQueue();
        }, delay);
    };

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
            scheduleNext(50); // Small delay for non-API resolution
            return;
        }
        
        const truncatedContent = currentSectionContent.length > 3000 ? currentSectionContent.substring(0, 3000) + '...' : currentSectionContent;

        const prompt = `
            Based on the semantic meaning and legal context of the following section:
            ---
            Title: ${currentSection.title}
            Content: ${truncatedContent}
            ---
            
            From the list of available section titles below, please identify up to 3 of the most relevant sections.
            
            Available Titles:
            ${otherSectionTitles.join('; ')}
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
                            description: "A list of up to 3 titles of sections that are semantically related to the input section.",
                            items: {
                                type: Type.STRING,
                                description: "The exact title of a related section from the provided list."
                            }
                        }
                    },
                    required: ["related_titles"]
                }
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

        // On success, continue with normal delay
        scheduleNext(INITIAL_DELAY_MS);

    } catch (error) {
        console.error(`Error fetching related sections from Gemini API for "${cacheKey}":`, error);

        const errorString = error instanceof Error ? error.message : String(error);
        const isRateLimitError = errorString.includes('"status":"RESOURCE_EXHAUSTED"') || errorString.includes('429');
        const isServerError = errorString.includes('"code":500');

        if ((isRateLimitError || isServerError) && retries < MAX_RETRIES) {
            // Re-queue with increased retry count
            const newRequest = { ...request, retries: retries + 1 };
            requestQueue.unshift(newRequest); // Add to the front of the queue

            // Calculate backoff delay
            const backoffDelay = INITIAL_DELAY_MS * Math.pow(2, retries) + Math.random() * 1000;
            console.warn(`API error for "${cacheKey}". Retrying in ${backoffDelay.toFixed(0)}ms... (Attempt ${retries + 1})`);
            
            scheduleNext(backoffDelay);

        } else {
            // Max retries reached or a different error, so reject
            if (isRateLimitError || isServerError) {
                 console.error(`Max retries (${MAX_RETRIES}) reached for "${cacheKey}". Giving up.`);
            }
            relatedSectionsCache.delete(cacheKey); // Invalidate cache on error
            reject(error);
            
            // Continue processing queue after a standard delay even on permanent failure
            scheduleNext(INITIAL_DELAY_MS);
        }
    }
}

/**
 * Finds related sections using the Gemini API based on semantic similarity, with queuing and exponential backoff to prevent rate-limiting.
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
        requestQueue.push({ resolve, reject, currentSection, allSections, cacheKey, retries: 0 });
        if (!isProcessingQueue) {
            processQueue();
        }
    });

    relatedSectionsCache.set(cacheKey, promise);
    return promise;
};