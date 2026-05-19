import { type Profile, type ProfileStore, type UserSettings } from './types';
declare function getStore(): Promise<ProfileStore>;
declare function createProfile(name: string): Promise<Profile>;
declare function switchProfile(profileId: string): Promise<void>;
declare function updateSettings(profileId: string, updates: Partial<UserSettings>): Promise<void>;
declare function renameProfile(profileId: string, name: string): Promise<void>;
declare function deleteProfile(profileId: string): Promise<void>;
declare function getActiveProfile(): Promise<Profile>;
export declare const profileManager: {
    getStore: typeof getStore;
    getActiveProfile: typeof getActiveProfile;
    createProfile: typeof createProfile;
    switchProfile: typeof switchProfile;
    updateSettings: typeof updateSettings;
    renameProfile: typeof renameProfile;
    deleteProfile: typeof deleteProfile;
};
export {};
