import { MSG, type ExtMessage } from '../shared/messages'
import { profileManager } from '../shared/profile'

chrome.runtime.onInstalled.addListener(() => {
  console.log('[LL Extension] Installed')
})

chrome.runtime.onMessage.addListener((msg: ExtMessage, _sender, sendResponse) => {
  if (msg.type === MSG.GET_ACTIVE_PROFILE) {
    profileManager.getActiveProfile().then(profile => {
      sendResponse({ type: MSG.ACTIVE_PROFILE_RESPONSE, payload: profile })
    })
    return true
  }
})
