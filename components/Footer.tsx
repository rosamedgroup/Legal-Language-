import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 mt-12 bg-[rgb(var(--background-secondary))] border-t border-[rgb(var(--border-primary))]">
      <div className="container mx-auto text-center text-[rgb(var(--text-tertiary))]">
        <p>الحمد لله الذي بنعمته تتم الصالحات</p>
        <p className="mt-2 text-sm">Law@adl.sa</p>
        <p className="mt-2 text-lg font-bold text-[rgb(var(--text-primary))]">ADL.sa</p>
      </div>
    </footer>
  );
};

export default Footer;