import 'server-only';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

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

function checkRateLimit(identifier: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const entry = store.get(identifier);

    if (!entry || entry.resetAt < now) {
        store.set(identifier, { count: 1, resetAt: now + windowMs });
        if (Math.random() < 0.01) cleanupExpired();
        return { success: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
        return { success: false, remaining: 0 };
    }

    entry.count++;
    return { success: true, remaining: limit - entry.count };
}

/**
 * Rate-Limit für Registrierungsversuche, IP-basiert.
 */
export function checkRegisterRateLimit(ip: string): RateLimitResult {
    return checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
}

/**
 * Rate-Limit für Login-Versuche, sc_handle-basiert (schützt den Account,
 * nicht die Quelle – bewusst kein IP-Schutz, s. Kommentar bei der Nutzung).
 */
export function checkLoginRateLimit(scHandle: string): RateLimitResult {
    return checkRateLimit(`login:${scHandle}`, 5, 15 * 60 * 1000);
}
