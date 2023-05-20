export interface ServerClaim {
    id: string,
    value: number | undefined
}

export interface ClaimsPerRole {
    [key: string]: ServerClaim[]
}

export interface ServerSettings {
    id: string,
    name: string,
    claims: ClaimsPerRole[]
}