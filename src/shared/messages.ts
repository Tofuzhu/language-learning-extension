export const MSG = {
  // Profile
  PROFILE_SWITCHED: 'PROFILE_SWITCHED',
  GET_ACTIVE_PROFILE: 'GET_ACTIVE_PROFILE',
  ACTIVE_PROFILE_RESPONSE: 'ACTIVE_PROFILE_RESPONSE',
  // Settings
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  // Subtitle / translation (Plan 2)
  FETCH_TRANSLATION: 'FETCH_TRANSLATION',
  TRANSLATION_RESPONSE: 'TRANSLATION_RESPONSE',
} as const

export type MessageType = (typeof MSG)[keyof typeof MSG]

export interface ExtMessage {
  type: MessageType
  payload?: unknown
}
