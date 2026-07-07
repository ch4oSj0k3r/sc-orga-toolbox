import NextAuth, { NextAuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'RSI Handle',
            credentials: {
                sc_handle: { label: 'RSI Handle', type: 'text' },
                password: { label: 'Passwort', type: 'password' },
            },
            // Hier deklarieren wir die Typen für credentials explizit inline
            async authorize(credentials: Record<'sc_handle' | 'password', string> | undefined) {
                if (!credentials?.sc_handle || !credentials?.password) {
                    return null;
                }

                const { sc_handle, password } = credentials;

                const user = await prisma.user.findUnique({
                    where: { sc_handle },
                });

                if (!user || !(await bcrypt.compare(password, user.password))) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.sc_handle,
                    status: user.status,
                    role: user.role,
                    verification_token: user.verification_token,
                };
            },
        }),
    ],
    callbacks: {
        // Typisierung über ein Destructuring-Objekt mit expliziten NextAuth-Typen
        async jwt({ token, user }: { token: JWT; user?: User }) {
            // Erster Login: Daten vom User-Objekt in das JWT schreiben
            if (user) {
                token.id = user.id;
                token.status = user.status;
                token.role = user.role;
                token.verification_token = user.verification_token;
            } else if (token.name) {
                // Status frisch aus der DB holen für die UX
                const dbUser = await prisma.user.findUnique({
                    where: { sc_handle: token.name },
                    select: { status: true, role: true },
                });

                if (dbUser) {
                    token.status = dbUser.status;
                    token.role = dbUser.role;
                }
            }
            return token;
        },

        async session({ session, token }: { session: Session; token: JWT }) {
            // Daten für das Frontend (useSession) verfügbar machen
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.status = token.status as string;
                session.user.role = token.role as string;
                session.user.verification_token = token.verification_token as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
