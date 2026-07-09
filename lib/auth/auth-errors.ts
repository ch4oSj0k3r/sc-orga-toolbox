/**
 * Mappt technische NextAuth- und Anwendungsfehler in lesbare, deutsche Nachrichten.
 */
export function getAuthErrorMessage(err: string | null): string | null {
    if (!err) return null;

    switch (err.toLowerCase()) {
        case 'rejected':
            return 'Deine Registrierung wurde abgelehnt (Zeitüberschreitung oder falsche Organisation). Bitte wende dich an den Support.';
        case 'credentialssignin':
            return 'RSI Handle oder Passwort falsch.';
        case 'configuration':
            return 'Es gibt ein Konfigurationsproblem mit dem Server. Bitte versuche es später noch einmal.';
        default:
            return `Ein unerwarteter Fehler ist aufgetreten (${err}).`;
    }
}
