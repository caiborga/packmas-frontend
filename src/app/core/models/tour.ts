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

export interface TourAssignments {
    members: Map<number, { car: number; things: number[] }>;
    things: Map<number, { member: number }>;
    cars: Map<number, { members: number[] }>;
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
