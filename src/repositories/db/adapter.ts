// Small adapters to map Prisma shapes -> domain shapes
// Convert numeric IDs produced by Prisma into string IDs expected by domain types
export function mapIdToString<T extends Record<string, any>>(row: T): T {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row } as Record<string, any>;
  if (typeof out.id === 'number') out.id = String(out.id);
  // common foreign keys
  if (typeof out.userId === 'number') out.userId = String(out.userId);
  if (typeof out.buyerCompanyId === 'number') out.buyerCompanyId = String(out.buyerCompanyId);
  return out as T;
}

export function mapArrayIds<T extends Record<string, any>>(rows: T[] | null | undefined): T[] | null {
  if (!rows) return rows ?? null;
  return rows.map(r => {
    const copy = { ...r } as Record<string, any>;
    if (typeof copy.id === 'number') copy.id = String(copy.id);
    // map nested arrays like quote_lines
    if (Array.isArray(copy.quote_lines)) {
      copy.quote_lines = copy.quote_lines.map((l: any) => {
        const ll = { ...l };
        if (typeof ll.id === 'number') ll.id = String(ll.id);
        if (typeof ll.productId === 'number') ll.productId = String(ll.productId);
        return ll;
      });
    }
    return copy as T;
  });
}

export function mapQuoteRow(row: any) {
  if (!row) return row;
  const out = mapIdToString(row);
  if (Array.isArray(out.quote_lines)) {
    out.quote_lines = out.quote_lines.map((l: any) => {
      const ll = { ...l };
      if (typeof ll.id === 'number') ll.id = String(ll.id);
      if (typeof ll.productId === 'number') ll.productId = String(ll.productId);
      return ll;
    });
  }
  return out;
}

export function mapUserRow(row: any) {
  if (!row) return row;
  return mapIdToString(row);
}

export function mapFormSubmissionRow(row: any) {
  if (!row) return row;
  return mapIdToString(row);
}

export function mapErrorLogRow(row: any) {
  if (!row) return row;
  return mapIdToString(row);
}
