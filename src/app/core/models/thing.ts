import { Member } from "./member";

export interface Thing {
    id: number,
    bearer?: number,
    category: string,
    name: string,
    weight: number,
}

export function initializeThing(): Thing {
    return {
        id: 0,
        category: 'CATEGORY',
        name: 'NAME',
        weight: 0
    };
}