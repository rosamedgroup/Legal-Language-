
import React from 'react';

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
}

const SettingsButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-amber-500 text-slate-900 font-bold'
        : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
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
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40"
      onClick={onClose}
      aria-hidden="true"
    ></div>
    <div
      className="fixed top-28 left-1/2 -translate-x-1/2 w-[90vw] max-w-md bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl z-50 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 id="settings-title" className="text-xl font-bold text-amber-400">
          Accessibility Settings
        </h2>
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="p-2 rounded-full hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {/* Font Size Control */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Font Size
          </label>
          <div className="flex items-center space-x-2 bg-slate-900/50 p-2 rounded-lg">
            <SettingsButton
              onClick={() => onFontSizeChange('base')}
              isActive={fontSize === 'base'}
            >
              Small
            </SettingsButton>
            <SettingsButton
              onClick={() => onFontSizeChange('lg')}
              isActive={fontSize === 'lg'}
            >
              Medium
            </SettingsButton>
            <SettingsButton
              onClick={() => onFontSizeChange('xl')}
              isActive={fontSize === 'xl'}
            >
              Large
            </SettingsButton>
          </div>
        </div>

        {/* Line Spacing Control */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Line Spacing
          </label>
          <div className="flex items-center space-x-2 bg-slate-900/50 p-2 rounded-lg">
            <SettingsButton
              onClick={() => onLineHeightChange('normal')}
              isActive={lineHeight === 'normal'}
            >
              Compact
            </SettingsButton>
            <SettingsButton
              onClick={() => onLineHeightChange('relaxed')}
              isActive={lineHeight === 'relaxed'}
            >
              Normal
            </SettingsButton>
            <SettingsButton
              onClick={() => onLineHeightChange('loose')}
              isActive={lineHeight === 'loose'}
            >
              Relaxed
            </SettingsButton>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="text-right mt-4">
        <button
          onClick={onResetSettings}
          className="text-sm font-medium text-gray-400 hover:text-amber-400 transition-colors duration-200 underline focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-sm"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Export Control */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Export Document
        </label>
        <button
          onClick={onExportPDF}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-md transition-colors duration-200 bg-slate-700 hover:bg-slate-600 text-gray-200 font-bold disabled:bg-slate-600/50 disabled:cursor-not-allowed"
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>تصدير كملف PDF</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default SettingsPanel;
