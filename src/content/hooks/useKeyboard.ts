import { useEffect } from 'react'

interface KeyboardActions {
  prevSentence: () => void
  nextSentence: () => void
  replaySentence: () => void
  toggleAutoPause: () => void
}

/**
 * Global keyboard shortcuts for playback control.
 * Only active on YouTube video pages, disabled when typing in inputs.
 * A = Prev sentence | D = Next sentence | S = Replay | Q = Toggle auto-pause
 */
export function useKeyboard(actions: KeyboardActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if ((e.target as HTMLElement).isContentEditable) return

      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault()
          e.stopPropagation()
          actions.prevSentence()
          break
        case 'd':
          e.preventDefault()
          e.stopPropagation()
          actions.nextSentence()
          break
        case 's':
          e.preventDefault()
          e.stopPropagation()
          actions.replaySentence()
          break
        case 'q':
          e.preventDefault()
          e.stopPropagation()
          actions.toggleAutoPause()
          break
      }
    }

    // Use capture phase so we intercept before YouTube's handlers
    document.addEventListener('keydown', handler, { capture: true })
    return () => document.removeEventListener('keydown', handler, { capture: true })
  }, [actions])
}
