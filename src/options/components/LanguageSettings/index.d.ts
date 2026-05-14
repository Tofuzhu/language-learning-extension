import { type UserSettings } from '../../../shared/types';
interface Props {
    settings: UserSettings;
    onChange: (updates: Partial<UserSettings>) => void;
}
export declare function LanguageSettings({ settings, onChange }: Props): import("react/jsx-runtime").JSX.Element;
export {};
