export declare const MSG: {
    readonly PROFILE_SWITCHED: "PROFILE_SWITCHED";
    readonly GET_ACTIVE_PROFILE: "GET_ACTIVE_PROFILE";
    readonly ACTIVE_PROFILE_RESPONSE: "ACTIVE_PROFILE_RESPONSE";
    readonly SETTINGS_UPDATED: "SETTINGS_UPDATED";
    readonly FETCH_TRANSLATION: "FETCH_TRANSLATION";
    readonly TRANSLATION_RESPONSE: "TRANSLATION_RESPONSE";
};
export type MessageType = (typeof MSG)[keyof typeof MSG];
export interface ExtMessage {
    type: MessageType;
    payload?: unknown;
}
