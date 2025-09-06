import React from 'react';
import { Section } from '../data/content';
import { slugify } from '../utils';

type FontSize = 'base' | 'lg' | 'xl';
type LineHeight = 'normal' | 'relaxed' | 'loose';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  lineHeight: LineHeight;
  onLineHeightChange: (height: LineHeight) => void;
  isGenerating: boolean;
  onExportPDF: () => void;
  onResetSettings: () => void;
  sections: Section[];
  introductionTitle?: string;
  selectedSections: string[];
  onSelectedSectionsChange: (selected: string[]) => void;
}

const SettingsButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 flex-1 ${
      isActive
        ? 'bg-white text-blue-600 font-semibold shadow-sm'
        : 'bg-transparent hover:bg-slate-200 text-slate-600'
    }`}
  >
    {children}
  </button>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  isGenerating,
  onExportPDF,
  onResetSettings,
  sections,
  introductionTitle,
  selectedSections,
  onSelectedSectionsChange,
}) => {
  if (!isOpen) return null;

  const allExportableItems = [
    ...(introductionTitle ? [{ title: introductionTitle, slug: 'introduction' }] : []),
    ...sections.map(s => ({ title: s.title, slug: slugify(s.title) })),
  ];

  const handleToggleSection = (slug: string) => {
    const newSelection = selectedSections.includes(slug)
      ? selectedSections.filter(s => s !== slug)
      : [...selectedSections, slug];
    onSelectedSectionsChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectedSectionsChange(allExportableItems.map(item => item.slug));
  };

  const handleDeselectAll = () => {
    onSelectedSectionsChange([]);
  };

  const allSelected = selectedSections.length === allExportableItems.length;
  const noneSelected = selectedSections.length === 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-xl shadow-lg z-50 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
          <h2 id="settings-title" className="text-lg font-bold text-slate-900">
            إعدادات الوصول والتصدير
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Font Size Control */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              حجم الخط
            </label>
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
              <SettingsButton
                onClick={() => onFontSizeChange('base')}
                isActive={fontSize === 'base'}
              >
                صغير
              </SettingsButton>
              <SettingsButton
                onClick={() => onFontSizeChange('lg')}
                isActive={fontSize === 'lg'}
              >
                متوسط
              </SettingsButton>
              <SettingsButton
                onClick={() => onFontSizeChange('xl')}
                isActive={fontSize === 'xl'}
              >
                كبير
              </SettingsButton>
            </div>
          </div>

          {/* Line Spacing Control */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              تباعد الأسطر
            </label>
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
              <SettingsButton
                onClick={() => onLineHeightChange('normal')}
                isActive={lineHeight === 'normal'}
              >
                مضغوط
              </SettingsButton>
              <SettingsButton
                onClick={() => onLineHeightChange('relaxed')}
                isActive={lineHeight === 'relaxed'}
              >
                عادي
              </SettingsButton>
              <SettingsButton
                onClick={() => onLineHeightChange('loose')}
                isActive={lineHeight === 'loose'}
              >
                واسع
              </SettingsButton>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="text-right mt-4">
          <button
            onClick={onResetSettings}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
          >
            إعادة تعيين الإعدادات
          </button>
        </div>

        {/* Export Control */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            تصدير المستند
          </label>
          
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={allSelected ? handleDeselectAll : handleSelectAll}
              className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              {allSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </button>
            <span className="text-xs text-slate-500">
              {selectedSections.length} / {allExportableItems.length} محدد
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            {allExportableItems.map(({ title, slug }) => (
              <label key={slug} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-slate-200/50 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedSections.includes(slug)}
                  onChange={() => handleToggleSection(slug)}
                  className="form-checkbox h-5 w-5 bg-gray-100 border-gray-300 text-blue-600 focus:ring-blue-500 rounded"
                  style={{float: 'right', marginLeft: '0.75rem'}}
                />
                <span className="text-slate-700 text-sm select-none">{title}</span>
              </label>
            ))}
          </div>

          <button
            onClick={onExportPDF}
            disabled={isGenerating || noneSelected}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-md transition-colors duration-200 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>جارٍ التصدير...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                <span>{noneSelected ? 'اختر أقسام للتصدير' : `تصدير (${selectedSections.length}) قسم كملف PDF`}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;