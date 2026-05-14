import { describe, it, expect } from 'vitest'
import { storage } from '../../src/shared/storage'

describe('storage', () => {
  it('returns null for missing keys', async () => {
    const result = await storage.get('nonexistent')
    expect(result).toBeNull()
  })

  it('stores and retrieves a value', async () => {
    await storage.set('test_key', { foo: 'bar' })
    const result = await storage.get<{ foo: string }>('test_key')
    expect(result).toEqual({ foo: 'bar' })
  })

  it('overwrites an existing value', async () => {
    await storage.set('key', 1)
    await storage.set('key', 2)
    expect(await storage.get<number>('key')).toBe(2)
  })

  it('removes a key', async () => {
    await storage.set('to_remove', 42)
    await storage.remove('to_remove')
    expect(await storage.get('to_remove')).toBeNull()
  })

  it('removing a non-existent key does not throw', async () => {
    await expect(storage.remove('ghost')).resolves.toBeUndefined()
  })
})
