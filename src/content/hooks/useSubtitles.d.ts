import type { SubtitleCue } from '../../shared/types';
export type SubtitleStatus = 'idle' | 'loading' | 'ready' | 'no-captions' | 'error';
export interface UseSubtitlesResult {
    cues: SubtitleCue[];
    status: SubtitleStatus;
    errorMessage: string;
    detectedLang: string;
    reload: () => void;
}
export declare function useSubtitles(videoId: string | null, targetLang: string, nativeLang: string): UseSubtitlesResult;
