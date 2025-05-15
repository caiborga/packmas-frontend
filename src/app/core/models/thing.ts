export interface Thing {
    id: number,
    bearer?: number,
    category: number,
    name: string,
    weight: number,
}

export interface TourThing {
    assignedMemberId?: number,
    id: number,
    created_at: string,
    thing_id: number,
    tour_id: number,
}

export function initializeThing(): Thing {
    return {
        id: 0,
        category: 0,
        name: 'NAME',
        weight: 0
    };
}