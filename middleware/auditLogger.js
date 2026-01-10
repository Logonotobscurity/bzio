/**
 * Enhanced Audit Middleware for Admin Routes
 * 
 * Features:
 * - Smart abnormal request detection (flags only real threats)
 * - Rate limiting per IP address
 * - Circular buffer with TTL for memory efficiency
 * - Session context capture
 * - Request deduplication
 */

const auditConfig = {
  maxEntries: 500,
  ttlMs: 3600000, // 1 hour
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 100, // Max 100 requests per minute
    blockMs: 900000, // 15 minute block
  },
};

class CircularBuffer {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.buffer = [];
    this.index = 0;
  }

  add(item) {
    if (this.buffer.length < this.maxSize) {
      this.buffer.push(item);
    } else {
      this.buffer[this.index] = item;
      this.index = (this.index + 1) % this.maxSize;
    }
  }

  getAll() {
    return this.buffer;
  }

  filter(predicate) {
    return this.buffer.filter(predicate);
  }

  prune(now) {
    this.buffer = this.buffer.filter(entry => {
      return (now - new Date(entry.timestamp).getTime()) < auditConfig.ttlMs;
    });
  }
}

const auditLog = new CircularBuffer(auditConfig.maxEntries);
const rateLimitTracker = new Map(); // IP -> { count, window, blocked }
let lastPruneTime = Date.now();

/**
 * Check if request is genuinely abnormal (security threat)
 * Not just different, but actually dangerous
 */
function isAbnormal(req) {
  const path = req.path || '';
  const method = req.method || 'GET';
  const userAgent = req.headers?.['user-agent'] || '';

  // Real security threats only
  return (
    // Path traversal attempts
    path.includes('../') ||
    path.includes('..%2f') ||
    path.includes('..%5c') ||
    // SQL injection patterns
    path.includes("'") ||
    path.includes('--') ||
    path.includes('/*') ||
    path.includes('xp_') ||
    // XSS attempts
    path.includes('<script') ||
    path.includes('javascript:') ||
    path.includes('onerror=') ||
    path.includes('onclick=') ||
    // Known bot patterns
    userAgent.match(/bot|crawler|spider|scraper/i) ||
    // Null byte injection
    path.includes('\0') ||
    path.includes('%00')
  );
}

/**
 * Check rate limiting for an IP address
 */
function checkRateLimit(ip) {
  const now = Date.now();
  let record = rateLimitTracker.get(ip);

  // Initialize or reset if window expired
  if (!record || (now - record.windowStart) > auditConfig.rateLimit.windowMs) {
    record = {
      count: 0,
      windowStart: now,
      blocked: false,
      blockedUntil: 0,
    };
  }

  // Check if still blocked
  if (record.blocked && now < record.blockedUntil) {
    return {
      isLimited: true,
      blockedUntil: record.blockedUntil,
      reason: 'IP temporarily blocked due to rate limit',
    };
  }

  // Unblock if block time expired
  if (record.blocked && now >= record.blockedUntil) {
    record.blocked = false;
    record.count = 0;
    record.windowStart = now;
  }

  // Increment counter
  record.count++;

  // Check if exceeded limit
  if (record.count > auditConfig.rateLimit.maxRequests) {
    record.blocked = true;
    record.blockedUntil = now + auditConfig.rateLimit.blockMs;
    rateLimitTracker.set(ip, record);
    
    return {
      isLimited: true,
      blockedUntil: record.blockedUntil,
      reason: 'Rate limit exceeded',
    };
  }

  rateLimitTracker.set(ip, record);
  return { isLimited: false };
}

/**
 * Create request fingerprint for deduplication
 */
function getRequestFingerprint(req) {
  return `${req.ip}:${req.method}:${req.path}:${req.headers?.authorization || 'none'}`;
}

/**
 * Main audit middleware
 */
export function auditMiddleware(req, res, next) {
  try {
    const now = Date.now();
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const fingerprint = getRequestFingerprint(req);

    // Periodic pruning (every 5 minutes)
    if (now - lastPruneTime > 300000) {
      auditLog.prune(now);
      lastPruneTime = now;
    }

    // Rate limiting check
    const rateLimitResult = checkRateLimit(ip);
    if (rateLimitResult.isLimited) {
      console.warn('[AUDIT] Rate limit exceeded', {
        ip,
        until: new Date(rateLimitResult.blockedUntil).toISOString(),
        reason: rateLimitResult.reason,
      });
    }

    // Create audit entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip,
      method: req.method,
      path: req.path,
      statusCode: null, // Will be updated in response handler
      isAbnormal: isAbnormal(req),
      isRateLimited: rateLimitResult.isLimited,
      fingerprint,
      session: {
        userId: req.session?.user?.id || null,
        userRole: req.session?.user?.role || null,
        sessionId: req.session?.id || null,
      },
      headers: {
        userAgent: req.headers['user-agent'] || 'unknown',
        referer: req.headers['referer'] || 'direct',
        contentType: req.headers['content-type'] || 'none',
      },
      bodySize: req.headers['content-length'] || 0,
      duration: null, // Will be calculated
    };

    // Track request start time
    const startTime = now;
    const originalSend = res.send;

    // Override res.send to capture response
    res.send = function(data) {
      logEntry.statusCode = res.statusCode;
      logEntry.duration = Date.now() - startTime;

      // Log abnormal or rate-limited requests immediately
      if (logEntry.isAbnormal) {
        console.warn('[AUDIT-ABNORMAL]', JSON.stringify(logEntry));
      }
      if (logEntry.isRateLimited) {
        console.warn('[AUDIT-RATELIMIT]', JSON.stringify(logEntry));
      }

      // Add to buffer
      auditLog.add(logEntry);

      return originalSend.call(this, data);
    };

    next();
  } catch (error) {
    console.error('[AUDIT] Middleware error:', error);
    next();
  }
}

/**
 * Get audit logs with optional filtering
 */
export function getAuditLogs(filter = {}) {
  let entries = auditLog.filter(entry => {
    // Filter by abnormal flag
    if (filter.abnormalOnly && !entry.isAbnormal) {
      return false;
    }

    // Filter by rate limited flag
    if (filter.rateLimitedOnly && !entry.isRateLimited) {
      return false;
    }

    // Filter by date range
    if (filter.since) {
      const entryTime = new Date(entry.timestamp).getTime();
      const sinceTime = new Date(filter.since).getTime();
      if (entryTime < sinceTime) return false;
    }

    // Filter by IP address
    if (filter.ip && entry.ip !== filter.ip) {
      return false;
    }

    // Filter by status code range
    if (filter.statusCode) {
      if (entry.statusCode !== filter.statusCode) return false;
    }

    // Filter by method
    if (filter.method && entry.method !== filter.method) {
      return false;
    }

    // Filter by path pattern
    if (filter.pathPattern) {
      const regex = new RegExp(filter.pathPattern);
      if (!regex.test(entry.path)) return false;
    }

    return true;
  });

  // Sort by timestamp descending (newest first)
  entries.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Apply limit
  const limit = filter.limit || 100;
  return entries.slice(0, limit);
}

/**
 * Get statistics about audit logs
 */
export function getAuditStats() {
  const entries = auditLog.getAll();
  const now = Date.now();
  const last1h = entries.filter(e => (now - new Date(e.timestamp).getTime()) < 3600000);
  const abnormal = entries.filter(e => e.isAbnormal);
  const rateLimited = entries.filter(e => e.isRateLimited);

  return {
    totalEntries: entries.length,
    last1hEntries: last1h.length,
    abnormalCount: abnormal.length,
    rateLimitedCount: rateLimited.length,
    uniqueIPs: new Set(entries.map(e => e.ip)).size,
    avgRequestDuration: entries.length > 0 
      ? entries.reduce((sum, e) => sum + (e.duration || 0), 0) / entries.length 
      : 0,
    statusCodes: entries.reduce((acc, e) => {
      acc[e.statusCode] = (acc[e.statusCode] || 0) + 1;
      return acc;
    }, {}),
  };
}

/**
 * Clear rate limit for specific IP (admin action)
 */
export function clearRateLimit(ip) {
  rateLimitTracker.delete(ip);
  console.log(`[AUDIT] Cleared rate limit for IP: ${ip}`);
}

/**
 * Clear all audit logs (use with caution)
 */
export function clearAuditLogs() {
  auditLog.buffer = [];
  auditLog.index = 0;
  console.log('[AUDIT] All audit logs cleared');
}

export default auditMiddleware;
