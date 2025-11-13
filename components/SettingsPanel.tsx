import React from 'react';

type FontSize = 'base' | 'lg' | 'xl';
type LineHeight = 'normal' | 'relaxed' | 'loose';
type Theme = 'light' | 'dark' | 'system';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  lineHeight: LineHeight;
  onLineHeightChange: (height: LineHeight) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onResetSettings: () => void;
}

const SegmentedControlButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    type="button"
    role="radio"
    aria-checked={isActive}
    onClick={onClick}
    className={`px-3 py-2 text-sm rounded-md transition-all duration-200 flex-1 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background-secondary))] ${
      isActive
        ? 'bg-[rgb(var(--background-secondary))] text-[rgb(var(--text-primary))] font-semibold shadow-sm'
        : 'bg-transparent hover:bg-[rgba(var(--text-primary),0.05)] text-[rgb(var(--text-secondary))]'
    }`}
  >
    {children}
  </button>
);

const ThemeIcon: React.FC<{ theme: Theme }> = ({ theme }) => {
    switch (theme) {
        case 'light':
            // Sun icon
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            );
        case 'dark':
            // Moon icon
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            );
        default: // System icon
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            );
    }
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  theme,
  onThemeChange,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'فاتح' },
    { value: 'dark', label: 'داكن' },
    { value: 'system', label: 'النظام' },
  ];

  const fontSizes: { value: FontSize, label: string }[] = [
      { value: 'base', label: 'صغير' },
      { value: 'lg', label: 'متوسط' },
      { value: 'xl', label: 'كبير' },
  ];

  const lineHeights: { value: LineHeight, label: string }[] = [
      { value: 'normal', label: 'مضغوط' },
      { value: 'relaxed', label: 'عادي' },
      { value: 'loose', label: 'واسع' },
  ];


  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-[rgb(var(--background-secondary))] rounded-xl shadow-lg z-50 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[rgb(var(--border-primary))]">
          <h2 id="settings-title" className="text-lg font-bold text-[rgb(var(--text-primary))]">
            إعدادات العرض
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 rounded-full hover:bg-[rgb(var(--background-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
            {/* Theme Control */}
            <div>
              <label id="theme-label" className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                المظهر
              </label>
              <div role="radiogroup" aria-labelledby="theme-label" className="flex items-center space-x-2 bg-[rgb(var(--background-tertiary))] p-1 rounded-lg">
                {themes.map(({ value, label }) => (
                  <SegmentedControlButton
                    key={value}
                    onClick={() => onThemeChange(value)}
                    isActive={theme === value}
                  >
                    <ThemeIcon theme={value} />
                    <span>{label}</span>
                  </SegmentedControlButton>
                ))}
              </div>
            </div>
            
          {/* Font Size Control */}
          <div>
            <label id="font-size-label" className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
              حجم الخط
            </label>
            <div role="radiogroup" aria-labelledby="font-size-label" className="flex items-center space-x-2 bg-[rgb(var(--background-tertiary))] p-1 rounded-lg">
              {fontSizes.map(({ value, label }) => (
                <SegmentedControlButton
                  key={value}
                  onClick={() => onFontSizeChange(value)}
                  isActive={fontSize === value}
                >
                  {label}
                </SegmentedControlButton>
              ))}
            </div>
          </div>

          {/* Line Spacing Control */}
          <div>
            <label id="line-height-label" className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
              تباعد الأسطر
            </label>
            <div role="radiogroup" aria-labelledby="line-height-label" className="flex items-center space-x-2 bg-[rgb(var(--background-tertiary))] p-1 rounded-lg">
              {lineHeights.map(({ value, label }) => (
                <SegmentedControlButton
                  key={value}
                  onClick={() => onLineHeightChange(value)}
                  isActive={lineHeight === value}
                >
                  {label}
                </SegmentedControlButton>
              ))}
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="text-right mt-6 pt-6 border-t border-[rgb(var(--border-primary))]">
          <button
            onClick={onResetSettings}
            className="text-sm font-medium text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--background-secondary))] rounded-sm"
          >
            إعادة تعيين الإعدادات
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;