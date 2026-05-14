export const MSG = {
  PROFILE_SWITCHED: 'PROFILE_SWITCHED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  GET_ACTIVE_PROFILE: 'GET_ACTIVE_PROFILE',
  ACTIVE_PROFILE_RESPONSE: 'ACTIVE_PROFILE_RESPONSE',
} as const

export type MessageType = (typeof MSG)[keyof typeof MSG]

export interface ExtMessage {
  type: MessageType
  payload?: unknown
}
