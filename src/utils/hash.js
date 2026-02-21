/**
 * cyrb53 - 53-битный хэш для строк
 * Детерминированный, синхронный, без зависимостей
 */
export function hash(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6e57d ^ seed;
  
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/**
 * Хэширование нескольких значений с разделителем
 */
export function hashMultiple(values, separator = '|') {
  return values.map(v => hash(v)).join(separator);
}

/**
 * Разбор хэш-строки на массив хэшей
 */
export function parseHashString(hashString, separator = '|') {
  if (!hashString) return [];
  return hashString.split(separator).filter(Boolean);
}