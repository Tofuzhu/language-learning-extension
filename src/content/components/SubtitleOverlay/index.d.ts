import type { SubtitleCue, FontSize } from '../../../shared/types';
import type { SubtitleStatus } from '../../hooks/useSubtitles';
interface SubtitleOverlayProps {
    cues: SubtitleCue[];
    currentCueIndex: number;
    status: SubtitleStatus;
    errorMessage: string;
    detectedLang: string;
    fontSize: FontSize;
    showTranslation: boolean;
    onReload: () => void;
    onPrev: () => void;
    onNext: () => void;
    onReplay: () => void;
    autoPause: boolean;
    onToggleAutoPause: () => void;
    playbackRate: number;
    onRateChange: (rate: number) => void;
    onToggleTranslation: () => void;
}
export declare function SubtitleOverlay({ cues, currentCueIndex, status, errorMessage, detectedLang, fontSize, showTranslation, onReload, onPrev, onNext, onReplay, autoPause, onToggleAutoPause, playbackRate, onRateChange, onToggleTranslation, }: SubtitleOverlayProps): import("react/jsx-runtime").JSX.Element;
export {};
