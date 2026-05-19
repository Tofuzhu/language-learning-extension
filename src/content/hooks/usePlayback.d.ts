import type { SubtitleCue } from '../../shared/types';
export interface UsePlaybackResult {
    currentTime: number;
    currentCueIndex: number;
    autoPause: boolean;
    playbackRate: number;
    prevSentence: () => void;
    nextSentence: () => void;
    replaySentence: () => void;
    toggleAutoPause: () => void;
    setRate: (rate: number) => void;
}
/**
 * Manages video playback: tracks current time, computes current subtitle index,
 * and provides sentence navigation + auto-pause.
 */
export declare function usePlayback(cues: SubtitleCue[], videoEl: HTMLVideoElement | null): UsePlaybackResult;
