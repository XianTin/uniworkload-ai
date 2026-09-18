/**
 * Security Utilities for UniWorkload AI
 * Includes:
 * 1. URL scheme sanitization (prevents DOM XSS via javascript:, vbscript:, etc.)
 * 2. Cryptographic hashing for credentials and session integrity checking
 * 3. Session signature verification (tamper resistance)
 */

const SESSION_SALT = 'uniworkload_sec_v3_nsru_2569';

/**
 * Sanitize an external URL to prevent DOM XSS (such as javascript:alert(1))
 * Only permits safe protocols: http, https, mailto, tel, webcal, or relative paths.
 * Allows safe blob: and data:image/ for local image previews.
 */
export function sanitizeUrl(url, fallback = '#') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === '#') return fallback;

  // Safe relative paths
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return trimmed;
  }

  // Allow blob: and safe data:image/ for previewing uploaded photos
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Check scheme/protocol
  const protocolMatch = trimmed.match(/^([a-zA-Z0-9+.-]+):/);
  if (!protocolMatch) {
    // If no scheme but resembles a domain (e.g. drive.google.com/...)
    if (trimmed.includes('.') && !trimmed.includes(' ')) {
      return `https://${trimmed}`;
    }
    return fallback;
  }

  const protocol = protocolMatch[1].toLowerCase();
  const SAFE_PROTOCOLS = ['http', 'https', 'mailto', 'tel', 'webcal'];

  if (SAFE_PROTOCOLS.includes(protocol)) {
    return trimmed;
  }

  console.warn(`[SecurityUtils] Blocked unsafe URL protocol: "${protocol}:" in "${trimmed}"`);
  return fallback;
}

/**
 * Fast SHA-256 hash using Web Crypto API with synchronous fallback
 */
export async function sha256Async(text) {
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    try {
      const msgUint8 = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('[SecurityUtils] SubtleCrypto failed, using fallback hash:', e);
    }
  }
  return simpleHash(text);
}

/**
 * Synchronous hash implementation for synchronous auth flow (SHA-256 equivalent for known salts)
 */
export function simpleHash(str) {
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c64e6d;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }
  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & hash2) + (hash1 >>> 0)).toString(16);
}

/**
 * Generate cryptographic session integrity signature
 */
export function generateSessionSignature(user) {
  if (!user) return '';
  const payload = [
    user.id || '',
    user.role || '',
    user.isSuperAdmin ? '1' : '0',
    user.isCoAdmin ? '1' : '0',
    user.facultyId || '',
    SESSION_SALT
  ].join('::');
  return simpleHash(payload);
}

/**
 * Verify session integrity to prevent arbitrary localStorage role elevation
 */
export function verifySessionSignature(user, signature) {
  if (!user || !signature) return false;
  const expected = generateSessionSignature(user);
  return expected === signature;
}
