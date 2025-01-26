import { Burden } from "./burden";

export interface Member {
    id: number,
    avatar: string,
    burden?: Burden[],
    name: string,
}