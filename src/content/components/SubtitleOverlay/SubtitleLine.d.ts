import type { SubtitleCue } from '../../../shared/types';
import type { FontSize, TranslationPosition } from '../../../shared/types';
interface SubtitleLineProps {
    cue: SubtitleCue;
    fontSize: FontSize;
    translationPosition: TranslationPosition;
    showTranslation: boolean;
}
export declare function SubtitleLine({ cue, fontSize, translationPosition, showTranslation }: SubtitleLineProps): import("react/jsx-runtime").JSX.Element;
export {};
