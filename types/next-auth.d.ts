import DefaultSession from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'REJECTED' | 'BANNED';
            role: 'GUEST' | 'MEMBER' | 'ADMIN';
            verification_token: string;
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        status: string;
        role: string;
        verification_token: string;
    }
}
