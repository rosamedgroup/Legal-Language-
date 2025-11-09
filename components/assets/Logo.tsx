import React from 'react';

const Logo: React.FC = () => (
    <a href={window.location.pathname.split('?')[0]} className="flex items-center gap-3 flex-shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md">
         <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-sky-600 dark:bg-sky-500 group-hover:bg-sky-700 dark:group-hover:bg-sky-400 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:scale-110">
                <path d="M16 16.5a2.5 2.5 0 0 0-5 0M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9" />
                <path d="M12 3v18" />
                <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
                <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9" />
                <path d="M8 16.5a2.5 2.5 0 0 0-5 0" />
            </svg>
        </div>
      <span className="font-bold text-xl text-zinc-800 dark:text-zinc-200 hidden sm:inline group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">ADL.sa</span>
    </a>
);

export default Logo;