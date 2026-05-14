export type Language = 'en' | 'es' | 'zh'
export type FamiliarityLevel = 0 | 1 | 2 | 3
export type FontSize = 'small' | 'medium' | 'large'
export type TranslationPosition = 'above' | 'below'
export type TranslationProvider = 'youtube' | 'google' | 'microsoft'

export interface UserSettings {
  targetLanguage: Language
  nativeLanguage: Language
  subtitleFontSize: FontSize
  translationPosition: TranslationPosition
  colorAnnotationEnabled: boolean
  translationProvider: TranslationProvider
}

export interface Profile {
  id: string
  name: string
  createdAt: number
  settings: UserSettings
}

export interface ProfileStore {
  activeProfileId: string
  profiles: Profile[]
}

export interface WordRecord {
  id: string
  word: string
  translation: string
  familiarity: FamiliarityLevel
  savedAt: number
  lastSeenAt: number
  context: string
  videoId: string
  videoTitle: string
}

export interface SubtitleCue {
  index: number
  startTime: number
  endTime: number
  originalText: string
  translatedText: string
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
}

export const FAMILIARITY_COLORS: Record<FamiliarityLevel, string> = {
  0: '#EF4444',
  1: '#EAB308',
  2: '#22C55E',
  3: 'inherit',
}

export const DEFAULT_SETTINGS: UserSettings = {
  targetLanguage: 'en',
  nativeLanguage: 'zh',
  subtitleFontSize: 'medium',
  translationPosition: 'above',
  colorAnnotationEnabled: true,
  translationProvider: 'youtube',
}

export const PROFILE_LIST_KEY = 'profile_list'

export function wordsKey(profileId: string): string {
  return `words_${profileId}`
}
