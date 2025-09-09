import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 mt-12 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto text-center text-slate-500 dark:text-slate-400">
        <p>الحمد لله الذي بنعمته تتم الصالحات</p>
        <p className="mt-2 text-sm">Law@adl.sa</p>
        <p className="mt-2 text-lg font-bold text-slate-800 dark:text-slate-200">ADL.sa</p>
      </div>
    </footer>
  );
};

export default Footer;