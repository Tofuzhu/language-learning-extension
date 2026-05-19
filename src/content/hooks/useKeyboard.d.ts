interface KeyboardActions {
    prevSentence: () => void;
    nextSentence: () => void;
    replaySentence: () => void;
    toggleAutoPause: () => void;
}
/**
 * Global keyboard shortcuts for playback control.
 * Only active on YouTube video pages, disabled when typing in inputs.
 * A = Prev sentence | D = Next sentence | S = Replay | Q = Toggle auto-pause
 */
export declare function useKeyboard(actions: KeyboardActions): void;
export {};
