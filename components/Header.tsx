
import React from 'react';

interface HeaderProps {
  onToggleSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSettings }) => {
  return (
    <header className="py-8 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/50 relative">
      <div className="container mx-auto text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-wide">
          محسنات الصياغة القانونية
        </h1>
        <p className="mt-4 text-lg md:text-xl text-amber-400">
          جمع وإعداد: د. عبد الله بن محمد الدخيل
        </p>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8">
        <button
          onClick={onToggleSettings}
          aria-label="Accessibility settings"
          className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700/70 text-gray-300 hover:text-amber-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;