export interface AccessGroupViewModel {
    id: string;
    key: string;
    name: string;
    description: string | null;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    memberCount: number;
    moduleCount: number;
}

export interface AccessGroupOption {
    id: string;
    key: string;
    name: string;
}
