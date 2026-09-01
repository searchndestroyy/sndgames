/**
 * Server-side (and optionally client-side) message content filter.
 * Uses regex patterns to catch profanity, URLs, spam, and XSS attempts.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type FilterResult =
  | { ok: true;  text: string }
  | { ok: false; reason: string }

// ─── Constants ───────────────────────────────────────────────────────────────

const MIN_LENGTH  = 1
const MAX_LENGTH  = 280

// ─── Pattern banks ───────────────────────────────────────────────────────────

/** Matches http/https URLs, bare www domains, and common TLD patterns. */
const URL_RE = /https?:\/\/[^\s]+|www\.[^\s]+|\b\S+\.(com|net|org|io|xyz|gg|tk|ru|cn|cc|co)[^\s]*/gi

/** Matches a sequence of 6+ identical chars (e.g. "aaaaaa", "!!!!!!"). */
const SPAM_CHAR_RE = /(.)\1{5,}/

/** Matches strings where >70% of alpha chars are uppercase (caps-spam). */
function isCapsSpam(text: string): boolean {
  const alpha = text.replace(/[^a-zA-Z]/g, '')
  if (alpha.length < 8) return false
  const upper = alpha.replace(/[^A-Z]/g, '').length
  return upper / alpha.length > 0.7
}

/**
 * Profanity patterns — written as character-class regexes so individual
 * letters are not strung together in source.  Each allows common leet
 * substitutions (@ → a, 3 → e, 1/! → i, 0 → o, $ → s, etc.).
 *
 * Format helper: each entry is [character-sequence-regex, flags].
 * The sequences use character classes for each position so the literal
 * word never appears as a continuous token in source.
 */
const PROFANITY_PATTERNS: RegExp[] = (() => {
  // Helper to build a leet-aware pattern for a word skeleton
  // Each array element is a string of valid chars for that position
  function leet(...positions: string[]): RegExp {
    const src = positions.map(p => `[${p}]+`).join('')
    return new RegExp(`\\b${src}\\b`, 'gi')
  }

  return [
    // f-word
    leet('fF', 'uU@*', 'cCkK'),
    // s-word
    leet('sS$', 'hH', 'iI!1', 'tT'),
    // a-word  
    leet('aA@4', 'sS$5', 'sS$5'),
    // b-word
    leet('bB', 'iI!1', 'tT', 'cCkK', 'hH'),
    // c-word (female anatomy)
    leet('cC', 'uU*', 'nN', 'tT'),
    // d-word
    leet('dD', 'iI!1', 'cCkK'),
    // n-slur
    leet('nN', 'iI!1', 'gG9', 'gG9', 'aAeE3'),
    // f-slur
    leet('fF', 'aA@4', 'gG9'),
    // r-word (ableist)
    leet('rR', 'eE3', 'tT', 'aA@4', 'rR', 'dD'),
    // w-word
    leet('wW', 'hH', 'oO0', 'rR', 'eE3'),
    // p-word
    leet('pP', 'uU*', 'sS$', 'sS$', 'yY'),
    // c-word 2 (male anatomy)
    leet('cC', 'oO0', 'cCkK'),
    // j-word
    leet('jJ', 'eE3', 'rR', 'kK'),
    // w-word 2
    leet('wW', 'aA@4', 'nN', 'kK'),
    // k-slur (ethnic)
    leet('kK', 'iI!1', 'kK', 'eE3'),
    // sp-slur (ethnic)
    leet('sS$', 'pP', 'iI!1', 'cC', '- ', 'kK'),
  ]
})()

// ─── HTML / XSS stripping ────────────────────────────────────────────────────

/** Remove all HTML tags and decode common HTML entities. */
function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')             // strip tags
    .replace(/&lt;/g,  '<')
    .replace(/&gt;/g,  '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/** Collapse multiple whitespace/newlines into a single space. */
function normalise(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

// ─── Main filter ─────────────────────────────────────────────────────────────

/**
 * Validates and cleans a chat message.
 * Returns `{ ok: true, text }` with the sanitised text,
 * or `{ ok: false, reason }` explaining why it was rejected.
 */
export function filterMessage(raw: string): FilterResult {
  // 1. Sanitise HTML / XSS
  let text = normalise(stripHtml(raw))

  // 2. Length checks
  if (text.length < MIN_LENGTH) return { ok: false, reason: 'Message is empty.' }
  if (text.length > MAX_LENGTH) return { ok: false, reason: `Max ${MAX_LENGTH} characters.` }

  // 3. URL / link spam
  if (URL_RE.test(text)) return { ok: false, reason: 'Links are not allowed in chat.' }

  // 4. Spam: repeated characters
  if (SPAM_CHAR_RE.test(text)) return { ok: false, reason: 'No spammy repeated characters.' }

  // 5. Caps spam
  if (isCapsSpam(text)) return { ok: false, reason: 'Please don\'t shout.' }

  // 6. Profanity
  for (const pattern of PROFANITY_PATTERNS) {
    pattern.lastIndex = 0 // reset stateful global regex
    if (pattern.test(text)) return { ok: false, reason: 'Message contains disallowed language.' }
  }

  return { ok: true, text }
}

/** Quick boolean check — useful on the client side for live feedback. */
export function isMessageClean(raw: string): boolean {
  return filterMessage(raw).ok
}
