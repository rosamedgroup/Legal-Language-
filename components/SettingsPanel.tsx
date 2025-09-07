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
  onResetSettings: () => void;
}

const SettingsButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    aria-pressed={isActive}
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
  onResetSettings,
}) => {
  if (!isOpen) return null;

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
            إعدادات العرض
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
            <label id="font-size-label" className="block text-sm font-medium text-slate-700 mb-2">
              حجم الخط
            </label>
            <div role="group" aria-labelledby="font-size-label" className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
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
            <label id="line-height-label" className="block text-sm font-medium text-slate-700 mb-2">
              تباعد الأسطر
            </label>
            <div role="group" aria-labelledby="line-height-label" className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
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
        <div className="text-right mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={onResetSettings}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
          >
            إعادة تعيين الإعدادات
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
