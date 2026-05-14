import type { ProfileStore } from '../../../shared/types';
interface Props {
    store: ProfileStore;
    onStoreChange: (store: ProfileStore) => void;
}
export declare function ProfileManager({ store, onStoreChange }: Props): import("react/jsx-runtime").JSX.Element;
export {};
