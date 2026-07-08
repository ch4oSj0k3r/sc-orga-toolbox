import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken, checkRsiHandleExists } from '@/lib/auth-utils';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        // Leerzeichen entfernen, um Tippfehler bei der Eingabe abzufangen
        const sc_handle = body.sc_handle?.trim();

        // 1. Validierung der Eingabedaten
        if (!sc_handle || !password) {
            return NextResponse.json(
                { error: 'Bitte gib einen RSI-Handle und ein Passwort an.' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' },
                { status: 400 }
            );
        }

        // 2. Prüfen, ob der Handle bereits in UNSERER Datenbank existiert
        const existingUser = await prisma.user.findUnique({
            where: { sc_handle },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Dieser RSI-Handle ist bereits in unserem System registriert.' },
                { status: 400 }
            );
        }

        // 3. Über die Orga-API prüfen, ob der Handle überhaupt bei RSI existiert
        const rsiExists = await checkRsiHandleExists(sc_handle);
        if (!rsiExists) {
            return NextResponse.json(
                {
                    error: 'Der angegebene RSI-Handle existiert nicht im Roberts Space Industries System.',
                },
                { status: 400 }
            );
        }

        // 4. Passwort sicher hashen (Salt-Rounds: 10 ist der performante Standard für bcrypt)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Den einzigartigen Verifizierungstoken generieren
        const verificationToken = generateVerificationToken();

        // 6. User in der MariaDB anlegen (Standard: PENDING & GUEST über das Schema geregelt)
        const newUser = await prisma.user.create({
            data: {
                sc_handle,
                password: hashedPassword,
                verification_token: verificationToken,
            },
            // Wir wählen nur die Felder aus, die wir sicher ans Frontend zurückgeben können
            select: {
                id: true,
                sc_handle: true,
                status: true,
                verification_token: true,
                createdAt: true,
            },
        });

        // 7. Erfolgreiche Antwort zurückgeben
        return NextResponse.json(
            {
                message: 'Registrierung erfolgreich. Bitte verifiziere deinen Account.',
                user: newUser,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Fehler im Registrierungs-Endpunkt:', error);
        return NextResponse.json(
            { error: 'Ein interner Serverfehler ist aufgetreten.' },
            { status: 500 }
        );
    }
}
