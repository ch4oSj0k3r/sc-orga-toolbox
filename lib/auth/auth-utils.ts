import 'server-only';

import crypto from 'crypto';
import { env } from '@/lib/env';

const ORGA_API_BASE = env.ORGA_API_BASE_URL;
const ORGA_API_KEY = env.ORGA_API_KEY;

interface RsiProfileData {
    bio: string;
    organizationId: string;
}

type RsiLookupResult =
    { kind: 'found'; data: RsiProfileData } | { kind: 'not_found' } | { kind: 'error' };

/**
 * Generiert einen eindeutigen Token im Format SC-XXXX-XXXX
 */
export function generateVerificationToken(): string {
    const buffer = crypto.randomBytes(4);
    const hex = buffer.toString('hex').toUpperCase();
    return `SC-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/**
 * Prüft über die Orga-API, ob ein RSI-Handle existiert
 */
export async function checkRsiHandleExists(handle: string): Promise<boolean> {
    const url = `${ORGA_API_BASE}/user/${encodeURIComponent(handle)}`;

    try {
        const headers: Record<string, string> = {
            Accept: 'application/json',
        };

        // Falls ein API-Key hinterlegt ist, hängen wir ihn als Bearer-Token an
        if (ORGA_API_KEY) {
            headers['Authorization'] = `Bearer ${ORGA_API_KEY}`;
        } else {
            console.warn('ORGA_API_KEY ist nicht in den Umgebungsvariablen definiert!');
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            next: { revalidate: 0 },
        });

        if (response.status === 200) {
            return true;
        }

        if (response.status === 404) {
            return false;
        }

        console.warn(`Orga-API lieferte unerwarteten Status: ${response.status}`);
        return false;
    } catch (error) {
        console.error('Fehler beim Aufruf der Orga-API:', error);
        return false;
    }
}

/**
 * Holt die Profildaten (Bio & Orga-ID) eines RSI-Handles von der Orga-API
 */
export async function getRsiProfileData(handle: string): Promise<RsiLookupResult> {
    const url = `${ORGA_API_BASE}/user/${encodeURIComponent(handle)}`;

    try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (ORGA_API_KEY) headers['Authorization'] = `Bearer ${ORGA_API_KEY}`;

        const response = await fetch(url, {
            method: 'GET',
            headers,
            next: { revalidate: 0 },
            signal: AbortSignal.timeout(5000),
        });

        if (response.status === 404) {
            return { kind: 'not_found' };
        }

        if (response.status !== 200) {
            console.warn(`Orga-API lieferte Status ${response.status} beim Abruf der Profildaten.`);
            return { kind: 'error' };
        }

        const data = await response.json();

        return {
            kind: 'found',
            data: {
                bio: data.data.bio || '',
                organizationId: data.data.organization.sid || '',
            },
        };
    } catch (error) {
        console.error('Fehler beim Abruf der RSI-Profildaten:', error);
        return { kind: 'error' };
    }
}
