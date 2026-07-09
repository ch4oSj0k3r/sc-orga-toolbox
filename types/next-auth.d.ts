import type { DefaultSession } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';
import type { UserStatus, Role } from '@/lib/generated/client';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            status: UserStatus;
            role: Role;
            verification_token: string;
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        status: UserStatus;
        role: Role;
        verification_token: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id: string;
        status: UserStatus;
        role: Role;
        verification_token: string;
    }
}
