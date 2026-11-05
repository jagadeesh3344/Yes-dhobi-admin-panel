/**
 * Formats raw database IDs (such as 25-character Prisma CUIDs) into clean,
 * consistent, and professional 5-digit display identifiers for Admin & Support teams.
 *
 * Prefixes requested:
 *  - Customers: CUST-XXXXX
 *  - Vendors:   VDR-XXXXX
 *  - Riders:    RDR-XXXXX
 *
 * Deterministic: The exact same database ID will ALWAYS generate the exact
 * same 5-digit number across all pages, reloads, and sessions.
 */

export function get5DigitNumber(rawId: string): string {
  if (!rawId) return '10000';

  // Check if it is a CUID (starts with 'c' followed by 20+ alphanumeric chars) or a UUID
  const isCuidOrUuid =
    /^c[a-z0-9]{20,}$/i.test(rawId) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i.test(rawId);

  // If NOT a raw CUID/UUID, check if it already has an intentional sequential number (e.g. CUST-101, V-102, VD100001)
  if (!isCuidOrUuid) {
    const match = rawId.match(/^([A-Za-z_-]+)(\d+)$/);
    if (match) {
      const n = parseInt(match[2], 10);
      const val = n >= 100000 ? n % 100000 || 10000 : n;
      return String(val).padStart(5, '0');
    }
  }

  // Deterministic 32-bit FNV-1a hash across the entire unique string
  let hash = 0x811c9dc5;
  for (let i = 0; i < rawId.length; i++) {
    hash ^= rawId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  const positive = Math.abs(hash);
  // Guarantee a stable 5-digit integer between 10000 and 99999
  const num = 10000 + (positive % 90000);
  return String(num);
}

export function formatCustomerDisplayId(id: string): string {
  if (!id) return 'CUST-10000';
  return `CUST-${get5DigitNumber(id)}`;
}

export function formatVendorDisplayId(id: string, registrationId?: string): string {
  const source = registrationId || id;
  if (!source) return 'VDR-10000';
  return `VDR-${get5DigitNumber(source)}`;
}

export function formatRiderDisplayId(id: string): string {
  if (!id) return 'RDR-10000';
  return `RDR-${get5DigitNumber(id)}`;
}
