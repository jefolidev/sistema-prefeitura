export type PermissoesCreateRequestBody = {
  name: string;
  description: string
};

export type PermissoesUpdateQuery = {
  id: string;
};

export type UserPermissionsGetQuery = {
  id: string;
}

export type UserPermissionsSwitchStatusQuery = {
  userId: string;
  permissionId: string;
}

