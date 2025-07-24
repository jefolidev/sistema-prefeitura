import ResponseApiDefault from "./ResponseApiDefault";

export type Grupos = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}
export interface GruposGetResponse extends ResponseApiDefault{
    data: Grupos[]
}

export interface GruposGetByIdResponse extends ResponseApiDefault {
    data?: Grupos
}

export type GruposCreateRequest = {
    name: string;
}

export type GruposUpdateRequest = {
    id: string;
    name: string;
}