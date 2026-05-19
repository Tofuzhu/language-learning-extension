interface ControlBarProps {
    autoPause: boolean;
    playbackRate: number;
    onPrev: () => void;
    onReplay: () => void;
    onNext: () => void;
    onToggleAutoPause: () => void;
    onRateChange: (rate: number) => void;
}
export declare function ControlBar({ autoPause, playbackRate, onPrev, onReplay, onNext, onToggleAutoPause, onRateChange, }: ControlBarProps): import("react/jsx-runtime").JSX.Element;
export {};
