import ResponseApiDefault from "./ResponseApiDefault"

export type Permissions = {
  id: string
  name: string
  description: string
  routesToRestrict: string[]
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsGetResponse extends ResponseApiDefault {
  data: Permissions[]
}

export interface PermissionsGetByIdResponse extends ResponseApiDefault {
  data?: Permissions
}

export type PermissionsCreateRequest = {
  name: string;
  description: string
}

export type PermissionsUpdateRequest = {
  id: string;
}
