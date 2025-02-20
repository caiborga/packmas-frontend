export interface Car {
    id: number,
    driver: number
    name: string
    passengers: number[]
    seats: number

    color?: string
    model?: string
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