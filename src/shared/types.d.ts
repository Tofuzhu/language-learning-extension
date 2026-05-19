export type Language = 'en' | 'es' | 'zh';
export type FamiliarityLevel = 0 | 1 | 2 | 3;
export type FontSize = 'small' | 'medium' | 'large';
export type TranslationPosition = 'above' | 'below';
export type TranslationProvider = 'youtube' | 'google' | 'microsoft';
export interface UserSettings {
    targetLanguage: Language;
    nativeLanguage: Language;
    subtitleFontSize: FontSize;
    translationPosition: TranslationPosition;
    colorAnnotationEnabled: boolean;
    translationProvider: TranslationProvider;
}
export interface Profile {
    id: string;
    name: string;
    createdAt: number;
    settings: UserSettings;
}
export interface ProfileStore {
    activeProfileId: string;
    profiles: Profile[];
}
export interface WordRecord {
    id: string;
    word: string;
    translation: string;
    familiarity: FamiliarityLevel;
    savedAt: number;
    lastSeenAt: number;
    context: string;
    videoId: string;
    videoTitle: string;
}
export interface SubtitleCue {
    index: number;
    startTime: number;
    endTime: number;
    originalText: string;
    translatedText: string;
}
export declare const LANGUAGE_LABELS: Record<Language, string>;
export declare const FAMILIARITY_COLORS: Record<FamiliarityLevel, string>;
export declare const DEFAULT_SETTINGS: UserSettings;
export declare const PROFILE_LIST_KEY = "profile_list";
export declare function wordsKey(profileId: string): string;
