export type ControlType = 'TABLE' | 'VIEW' | 'UNDEFINED'

export interface Setting {
    id: number
    value: string,
    table: string,
    control: ControlType
}

export interface View {
    name: string,
    link: string
}