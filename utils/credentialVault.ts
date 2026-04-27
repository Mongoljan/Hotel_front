import crypto from 'crypto'
import { cookies } from 'next/headers'

/**
 * Credential Vault
 * --------------------------------
 * Stores the user's login credentials in an httpOnly, encrypted cookie so
 * the server can transparently re-authenticate against the backend when its
 * short-lived backend token expires (the backend currently has no refresh
 * endpoint).
 *
 * Security notes:
 *  - Cookie is httpOnly, Secure (in prod), SameSite=Strict — JS cannot read it.
 *  - Payload is AES-256-GCM encrypted with NEXTAUTH_SECRET.
 *  - This is NOT a substitute for a real backend refresh-token flow; remove
 *    once the backend exposes one.
 */

const COOKIE_NAME = 'auth-creds'
const ALGO = 'aes-256-gcm'
const SECRET_SOURCE = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development'

// Derive a 32-byte key from the secret (stable across processes)
const KEY = crypto.createHash('sha256').update(SECRET_SOURCE).digest()

// Default lifetime for the credential cookie (long-ish so refresh keeps working
// even after the JWT cookie itself has expired). User can still force re-login.
const DEFAULT_MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 7 days

export interface StoredCredentials {
  email: string
  password: string
}

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: base64(iv).base64(tag).base64(ciphertext)
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`
}

function decrypt(payload: string): string | null {
  try {
    const [ivB64, tagB64, dataB64] = payload.split('.')
    if (!ivB64 || !tagB64 || !dataB64) return null
    const iv = Buffer.from(ivB64, 'base64url')
    const tag = Buffer.from(tagB64, 'base64url')
    const data = Buffer.from(dataB64, 'base64url')
    const decipher = crypto.createDecipheriv(ALGO, KEY, iv)
    decipher.setAuthTag(tag)
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
    return decrypted.toString('utf8')
  } catch {
    return null
  }
}

export async function storeCredentials(creds: StoredCredentials, maxAgeSeconds: number = DEFAULT_MAX_AGE_SECONDS) {
  const cookieStore = await cookies()
  const value = encrypt(JSON.stringify(creds))
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: maxAgeSeconds,
    path: '/',
  })
}

export async function readCredentials(): Promise<StoredCredentials | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return null
  const decrypted = decrypt(raw)
  if (!decrypted) return null
  try {
    const parsed = JSON.parse(decrypted) as StoredCredentials
    if (!parsed.email || !parsed.password) return null
    return parsed
  } catch {
    return null
  }
}

export async function clearCredentials() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
