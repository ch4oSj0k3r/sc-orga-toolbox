import crypto from 'crypto';

const ORGA_API_BASE = process.env.ORGA_API_BASE_URL;
const ORGA_API_KEY = process.env.ORGA_API_KEY;

interface RsiProfileData {
    bio: string;
    organizationId: string;
}

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
export async function getRsiProfileData(handle: string): Promise<RsiProfileData | null> {
    const url = `${ORGA_API_BASE}/user/${encodeURIComponent(handle)}`;

    try {
        const headers: Record<string, string> = {
            Accept: 'application/json',
        };

        if (ORGA_API_KEY) {
            headers['Authorization'] = `Bearer ${ORGA_API_KEY}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            next: { revalidate: 0 },
        });

        if (response.status !== 200) {
            console.warn(`Orga-API lieferte Status ${response.status} beim Abruf der Profildaten.`);
            return null;
        }

        const data = await response.json();

        return {
            bio: data.data.bio || '',
            organizationId: data.organization.sid || '',
        };
    } catch (error) {
        console.error('Fehler beim Abruf der RSI-Profildaten:', error);
        return null;
    }
}
