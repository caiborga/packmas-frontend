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
}

export interface TourMembersObject {
    ids: number[];
    data: Member[];
}

export interface Tour {
    id: number;
    tour_data: TourData;
    tour_cars: TourCarsObject;
    tour_things: TourThingsObject;
    tour_members: TourMembersObject;
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
            data: []
        },

        tour_members: {
            ids: [],
            data: []
        },
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
