import { Permissions } from "./PermissoesRequests";
import ResponseApiDefault from "./ResponseApiDefault";

export type UserPermissions = {
  id: string;
  name: string;
  description: string
  permission: Permissions
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface UserPermissionsGetResponse extends ResponseApiDefault {
  data: UserPermissions[]
}
