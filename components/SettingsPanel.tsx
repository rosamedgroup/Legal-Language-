
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
    </div>
  );
};

export default SettingsPanel;
