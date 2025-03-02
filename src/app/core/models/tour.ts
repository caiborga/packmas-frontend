import { Member } from './member';
import { Thing } from './thing';

export interface TourData {
    destination: string;
    start: string;
    end: string;
    name: string;
}

export interface TourCarsObject {
    ids: number[];
    data: any[];
}

export interface TourThingsObject {
    ids: number[];
    data: Thing[];
    totalWeight: number
}

export interface TourMembersObject {
    ids: number[];
    data: Member[];
}

export interface TourAssignments {
    members: Map<number, { car: number; things: number[] }>;
    things: Map<number, { member: number }>;
    cars: Map<number, { members: number[] }>;
}

export interface Tour {
    id: number;
    tour_data: TourData;
    tour_cars: TourCarsObject;
    tour_things: TourThingsObject;
    tour_members: TourMembersObject;
    tour_assignments: TourAssignments;
}

export function initializeTour(overrides: Partial<Tour> = {}): Tour {
    return {
        id: 0,
        tour_data: {
            destination: 'DESTINATION',
            start: 'START',
            end: 'END',
            name: 'NAME',
            ...overrides.tour_data,
        },
        tour_cars: {
            ids: [],
            data: []
        },
        
        tour_things: {
            ids: [],
            data: [],
            totalWeight: 0
        },

        tour_members: {
            ids: [],
            data: []
        },

        tour_assignments: {
            members: new Map<number, { car: number; things: number[] }>(),
            things: new Map<number, { member: number }>(),
            cars: new Map<number, { members: number[] }>(),
        },
        ...overrides,
    };
}

export function initializeTourAssignments(
    overrides: Partial<TourAssignments> = {}
): TourAssignments {
    return {
        members: new Map<number, { car: number; things: number[] }>(),
        things: new Map<number, { member: number }>(),
        cars: new Map<number, { members: number[] }>(),
        ...overrides,
    };
}

export function initializeTourData(
    overrides: Partial<TourData> = {}
): TourData {
    return {
        destination: 'DESTINATION',
        start: 'START',
        end: 'END',
        name: 'NAME',
        ...overrides,
    };
}
