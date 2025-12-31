
export type FontSize = 'base' | 'lg' | 'xl';
export type LineHeight = 'normal' | 'relaxed' | 'loose';
export type Theme = 'light' | 'dark' | 'system';
export type DocumentType = 'enhancements' | 'caseStudy' | 'statementOfClaim' | 'newClassification' | 'moralDamages' | 'criminalJusticeQA' | 'generalJudiciaryQA' | 'arbitrationAwards';
export type Bookmarks = Partial<Record<DocumentType, string[]>>;

export interface AppSettings {
  fontSize: FontSize;
  lineHeight: LineHeight;
  theme: Theme;
}
