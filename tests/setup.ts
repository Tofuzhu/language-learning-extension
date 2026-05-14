import { vi, beforeEach } from 'vitest'

const mockStorageData: Record<string, unknown> = {}

const mockStorage = {
  get: vi.fn(async (key: string) => {
    return { [key]: mockStorageData[key] }
  }),
  set: vi.fn(async (items: Record<string, unknown>) => {
    Object.assign(mockStorageData, items)
  }),
  remove: vi.fn(async (key: string) => {
    delete mockStorageData[key]
  }),
}

Object.defineProperty(global, 'chrome', {
  value: {
    storage: { local: mockStorage },
    runtime: {
      sendMessage: vi.fn(),
      onMessage: { addListener: vi.fn() },
      onInstalled: { addListener: vi.fn() },
      openOptionsPage: vi.fn(),
    },
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn(),
    },
  },
  writable: true,
})

beforeEach(() => {
  Object.keys(mockStorageData).forEach(k => delete mockStorageData[k])
  vi.clearAllMocks()
})
