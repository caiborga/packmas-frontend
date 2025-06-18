export interface Pagination {
    filter?: string;
    limit: number;
    offset?: number;
    page: number;
    total?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}
