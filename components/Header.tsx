
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-8 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/50">
      <div className="container mx-auto text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-wide">
          محسنات الصياغة القانونية
        </h1>
        <p className="mt-4 text-lg md:text-xl text-amber-400">
          جمع وإعداد: د. عبد الله بن محمد الدخيل
        </p>
      </div>
    </header>
  );
};

export default Header;
