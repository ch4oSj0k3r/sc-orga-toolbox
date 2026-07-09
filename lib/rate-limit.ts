import 'server-only';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Verhindert unbegrenztes Wachstum des Map über Zeit
function cleanupExpired() {
    const now = Date.now();
    for (const [key, entry] of store) {
        if (entry.resetAt < now) store.delete(key);
    }
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
}

/**
 * Simpler Fixed-Window Rate Limiter, In-Memory.
 * Nur für Single-Container-Deployments geeignet (kein shared State).
 */
export function checkRateLimit(
    identifier: string,
    limit: number,
    windowMs: number
): RateLimitResult {
    const now = Date.now();
    const entry = store.get(identifier);

    if (!entry || entry.resetAt < now) {
        store.set(identifier, { count: 1, resetAt: now + windowMs });
        if (Math.random() < 0.01) cleanupExpired(); // gelegentliches Aufräumen, kein Cron nötig
        return { success: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
        return { success: false, remaining: 0 };
    }

    entry.count++;
    return { success: true, remaining: limit - entry.count };
}
