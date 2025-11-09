import React, { useState, useEffect } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    title: string;
    url: string;
  } | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, content }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen || !content) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(content.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const emailSubject = `Check out this legal resource: ${content.title}`;
  const emailBody = `I found this interesting resource, '${content.title}', from 'محسنات الصياغة القانونية' and thought you might like it:\n\n${content.url}`;
  const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-white dark:bg-zinc-800 rounded-xl shadow-lg z-50 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="share-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            مشاركة المحتوى
          </h2>
          <button
            onClick={onClose}
            aria-label="Close share dialog"
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        
        <div className="mb-6 text-zinc-600 dark:text-zinc-300">
          <p>مشاركة "{content.title}"</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 p-2 rounded-lg">
            <input
              type="text"
              value={content.url}
              readOnly
              className="flex-1 bg-transparent text-zinc-600 dark:text-zinc-300 px-2 py-1 outline-none text-left"
              aria-label="Shareable link"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 w-28 text-center ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              {copied ? 'تم النسخ!' : 'نسخ الرابط'}
            </button>
          </div>
          
          <a
            href={mailtoLink}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold rounded-md transition-colors duration-200 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-600 dark:hover:bg-zinc-500 dark:text-zinc-200 dark:border-zinc-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z"/>
            </svg>
            <span>مشاركة عبر البريد الإلكتروني</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default ShareModal;