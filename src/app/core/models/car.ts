export interface Car {
    id: number,
    driver: number
    name: string
    passengers: number[]
    seats: number

    color?: string
    model?: string
}

export interface TourCar {
    id: number,
    car_id: number,
    created_at: string,
    tour_id: number,
}

export interface TourCarMember {
    id: number,
    car_id: number,
    created_at: string,
    member_id: number,
    tour_id: number,
}

export function initializeCar(overrides: Partial<Car> = {}): Car {
    return {
        id: -1,
        driver: -1,
        name: 'Neues Auto',
        passengers: [],
        seats: 4,
        ...overrides,
    };
}