
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
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl z-50 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="share-title" className="text-xl font-bold text-amber-400">
            مشاركة المحتوى
          </h2>
          <button
            onClick={onClose}
            aria-label="Close share dialog"
            className="p-2 rounded-full hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6 text-gray-300">
          <p className="font-semibold">مشاركة "{content.title}"</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center bg-slate-900/50 p-2 rounded-lg">
            <input
              type="text"
              value={content.url}
              readOnly
              className="flex-1 bg-transparent text-gray-400 px-2 py-1 outline-none"
              aria-label="Shareable link"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 w-28 text-center ${
                copied
                  ? 'bg-green-500 text-white font-bold'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold'
              }`}
            >
              {copied ? 'تم النسخ!' : 'نسخ الرابط'}
            </button>
          </div>
          
          <a
            href={mailtoLink}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm rounded-md transition-colors duration-200 bg-slate-700 hover:bg-slate-600 text-gray-200 font-bold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>مشاركة عبر البريد الإلكتروني</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default ShareModal;
