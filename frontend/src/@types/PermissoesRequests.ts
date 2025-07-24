import ResponseApiDefault from "./ResponseApiDefault"

export type Permissions = {
  id: string
  name: string
  description: string
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsGetResponse extends ResponseApiDefault {
  data: Permissions[]
}

export type PermissionsCreateRequest = {
  name: string;
  description: string
  isActive: boolean
}

export type PermissionsUpdateRequest = {
  id: string;
}
