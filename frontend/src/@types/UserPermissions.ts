import ResponseApiDefault from "./ResponseApiDefault";

export type UserPermissions = {
  id: string;
  name: string;
  description: string
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface UserPermissionsGetResponse extends ResponseApiDefault {
  data: UserPermissions[]
}
