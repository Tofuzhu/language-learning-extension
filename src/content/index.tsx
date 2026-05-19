import { createRoot } from 'react-dom/client'
import { App } from './components/App'
import { waitForPlayer } from './utils/youtubeHelpers'

console.log('[LL Extension] Content script loaded')

// We run at document_idle, so the player might already exist or need waiting
async function mount() {
  try {
    const player = await waitForPlayer(15000)

    // Create our container inside the player (so it scales with fullscreen)
    const containerId = 'll-ext-root'
    let container = document.getElementById(containerId)
    if (container) {
      // Already mounted (e.g., hot reload), skip
      return
    }

    container = document.createElement('div')
    container.id = containerId
    container.style.cssText = [
      'position: absolute',
      'inset: 0',
      'pointer-events: none',
      'z-index: 2147480000',
      'overflow: hidden',
    ].join('; ')

    player.appendChild(container)

    // Hide YouTube's native subtitles to avoid overlap
    const styleEl = document.createElement('style')
    styleEl.id = 'll-ext-styles'
    styleEl.textContent = `
      .ytp-caption-window-container { display: none !important; }
    `
    document.head.appendChild(styleEl)

    const root = createRoot(container)
    root.render(<App />)

    console.log('[LL Extension] App mounted into player')
  } catch (err) {
    console.error('[LL Extension] Mount failed:', err)
  }
}

mount()
