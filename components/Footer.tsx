
import React from 'react';
import Logo from './assets/Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-16 pb-8 mt-12 bg-[rgb(var(--background-secondary))] border-t border-[rgb(var(--border-primary))] transition-colors duration-300">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand and Description */}
          <div className="space-y-6 lg:col-span-2">
            <Logo />
            <p className="text-base text-[rgb(var(--text-secondary))] leading-relaxed max-w-md">
              منصة متخصصة في محسنات الصياغة القانونية والأحكام القضائية، تهدف إلى إثراء المحتوى القانوني وتطوير المهارات المهنية للقانونيين والباحثين في الميدان العدلي.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://twitter.com/aljamili_law" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-[rgb(var(--background-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--primary))] hover:text-white transition-all duration-300 shadow-sm" aria-label="X (Twitter)">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://twitter.com/tw_alwi" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-[rgb(var(--background-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--primary))] hover:text-white transition-all duration-300 shadow-sm" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[rgb(var(--text-primary))] uppercase tracking-[0.2em] border-r-2 border-[rgb(var(--primary))] pr-3">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--text-tertiary))]"></span>
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--text-tertiary))]"></span>
                  شروط الاستخدام
                </a>
              </li>
              <li>
                <a href="https://moj.gov.sa" target="_blank" rel="noopener noreferrer" className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--text-tertiary))]"></span>
                  وزارة العدل
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[rgb(var(--text-primary))] uppercase tracking-[0.2em] border-r-2 border-[rgb(var(--primary))] pr-3">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="mt-1 p-2 rounded-lg bg-[rgb(var(--background-tertiary))] text-[rgb(var(--text-tertiary))] group-hover:text-[rgb(var(--primary))] group-hover:bg-[rgb(var(--primary)/0.1)] transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[rgb(var(--text-tertiary))] uppercase">البريد الإلكتروني</span>
                  <a href="mailto:Law@adl.sa" className="text-sm font-medium text-[rgb(var(--text-primary))] hover:text-[rgb(var(--primary))] transition-colors">Law@adl.sa</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="mt-1 p-2 rounded-lg bg-[rgb(var(--background-tertiary))] text-[rgb(var(--text-tertiary))] group-hover:text-[rgb(var(--primary))] group-hover:bg-[rgb(var(--primary)/0.1)] transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[rgb(var(--text-tertiary))] uppercase">الموقع</span>
                  <span className="text-sm font-medium text-[rgb(var(--text-primary))]">المملكة العربية السعودية</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[rgb(var(--border-secondary))] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-sm text-[rgb(var(--text-tertiary))] text-center md:text-right">
              جميع الحقوق محفوظة © {currentYear} <span className="font-extrabold text-[rgb(var(--text-primary))]">ADL.sa</span>
            </p>
            <p className="text-[10px] text-[rgb(var(--text-tertiary))] italic opacity-75">تطوير مستمر لخدمة العدالة</p>
          </div>
          
          <div className="flex items-center gap-4 bg-[rgb(var(--background-tertiary))] px-4 py-2 rounded-full">
            <span className="text-xs font-bold text-[rgb(var(--primary))] whitespace-nowrap">الحمد لله الذي بنعمته تتم الصالحات</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
