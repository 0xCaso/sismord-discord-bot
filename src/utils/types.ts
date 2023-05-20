export interface ServerClaim {
    id: string,
    value: number | undefined
}

export interface ServerSettings {
    id: string,
    name: string,
    roles: string[],
    claims: ServerClaim[]
}