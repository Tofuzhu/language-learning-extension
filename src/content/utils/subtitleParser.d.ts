import type { SubtitleCue } from '../../shared/types';
export declare function parseJson3(json: string): Array<{
    start: number;
    end: number;
    text: string;
}>;
export declare function parseTimedTextXml(xml: string): Array<{
    start: number;
    end: number;
    text: string;
}>;
export declare function mergeCues(original: Array<{
    start: number;
    end: number;
    text: string;
}>, translated: Array<{
    start: number;
    end: number;
    text: string;
}>): SubtitleCue[];
