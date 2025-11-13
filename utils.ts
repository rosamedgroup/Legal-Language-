import React from 'react';

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
