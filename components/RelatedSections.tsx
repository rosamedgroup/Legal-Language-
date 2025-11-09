import React, { useState, useEffect, useRef } from 'react';
import { Section } from '../data/content';
import { getRelatedSections, slugify } from '../utils';
import Placeholder from './Placeholder';

interface RelatedSectionsProps {
  currentSection: Section;
  allSections: Section[];
}

const RelatedSectionsSkeleton: React.FC = () => (
    <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3"></div>
        <div className="space-y-2">
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
        </div>
    </div>
);

const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      // Update the URL hash without adding to browser history for better UX
      // Prevent replaceState on blob URLs which causes a SecurityError in sandboxed environments
      if (history.replaceState && window.location.protocol !== 'blob:') {
        history.replaceState(null, '', `#${slug}`);
      }
    }
};


const RelatedSections: React.FC<RelatedSectionsProps> = ({ currentSection, allSections }) => {
  const [related, setRelated] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      {
        rootMargin: '0px 0px 200px 0px', // Trigger when 200px from bottom of viewport
        threshold: 0.01
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasBeenVisible]);

  useEffect(() => {
    if (hasBeenVisible) {
      setIsLoading(true);
      setError(null);
      getRelatedSections(currentSection, allSections)
        .then(relatedTitles => {
          setRelated(relatedTitles);
        })
        .catch(err => {
          console.error("Failed to load related sections", err);
          setError("لم نتمكن من تحميل الأقسام ذات الصلة. يرجى المحاولة مرة أخرى لاحقاً.");
          // Set empty array on error
          setRelated([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [hasBeenVisible, currentSection, allSections]);

  return (
    <div ref={ref} className="mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-700/80 related-sections-container min-h-[100px]">
      {isLoading ? (
        <RelatedSectionsSkeleton />
      ) : error ? (
        <Placeholder type="error" title="حدث خطأ" message={error} />
      ) : related.length > 0 ? (
        <>
          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            أقسام ذات صلة
          </h3>
          <ul className="space-y-2">
            {related.map((relatedTitle, index) => {
                const slug = slugify(relatedTitle);
                return (
              <li key={index}>
                <a
                  href={`#${slug}`}
                  onClick={(e) => handleLinkClick(e, slug)}
                  className="flex items-center text-sm text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 hover:underline transition-colors duration-200 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                  </svg>
                  <span>{relatedTitle}</span>
                </a>
              </li>
            );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
};

export default RelatedSections;