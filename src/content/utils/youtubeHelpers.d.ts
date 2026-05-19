interface CaptionTrack {
    baseUrl: string;
    languageCode: string;
    name: {
        simpleText: string;
    };
    kind?: string;
}
export declare function getCaptionTracks(): CaptionTrack[];
export declare function pickTrack(tracks: CaptionTrack[], langCode: string): CaptionTrack | null;
export declare function buildOriginalUrl(baseUrl: string): string;
export declare function buildTranslatedUrl(baseUrl: string, targetLang: string): string;
export declare function getVideoId(): string | null;
export declare function getVideoElement(): HTMLVideoElement | null;
export declare function waitForPlayer(timeout?: number): Promise<Element>;
export {};
