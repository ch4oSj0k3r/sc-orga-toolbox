import type { Role, UserStatus } from '@/lib/generated/client';

export interface AdminUser {
    id: string;
    sc_handle: string;
    status: UserStatus;
    role: Role;
    failed_attempts: number;
    createdAt: Date;
    rejectedAt: Date | null;
    bannedAt: Date | null;
}
