export interface Member {
    id: number,
    avatar: string,
    name: string,
}

export interface TourMember {
    id: number,
    member_id: number,
    created_at: string,
    tour_id: number,
}