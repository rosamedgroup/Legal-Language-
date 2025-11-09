import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 mt-12 bg-transparent border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto text-center text-zinc-500 dark:text-zinc-400">
        <p>الحمد لله الذي بنعمته تتم الصالحات</p>
        <p className="mt-2 text-sm">Law@adl.sa</p>
        <p className="mt-2 text-lg font-bold text-zinc-800 dark:text-zinc-200">ADL.sa</p>
      </div>
    </footer>
  );
};

export default Footer;