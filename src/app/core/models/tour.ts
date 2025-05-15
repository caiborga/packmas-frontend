import { Car } from './car';
import { Member } from './member';
import { Thing } from './thing';

export interface TourData {
    id: number;
    destination: string;
    start: string;
    end: string;
    tourMembers: Member[];
    tourThings: Thing[];
    tourCars: Car[];
    tourThingsWeight: number;
}

export interface Tour {
    id: number;
    tourData: TourData;
}

export function initializeTour(overrides: Partial<Tour> = {}): Tour {
    return {
        id: 0,
        tourData: {
            id: 0,
            destination: 'DESTINATION',
            start: 'START',
            end: 'END',
            tourMembers: [],
            tourThings: [],
            tourCars: [],
            tourThingsWeight: 0,
            ...overrides.tourData,
        }
    };
}

export function initializeTourData(
    overrides: Partial<TourData> = {}
): TourData {
    return {
        id: 0,
        destination: 'DESTINATION',
        start: 'START',
        end: 'END',
        tourMembers: [],
        tourThings: [],
        tourCars: [],
        tourThingsWeight: 0,
        ...overrides,
    };
}
