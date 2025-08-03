export type PermissoesCreateRequestBody = {
  name: string;
  description: string
  routesToRestrict: string[];
};

export type PermissoesUpdateQuery = {
  id: string;
};

export type PermissoesUpdateRoutesToRestrictBody = {
  routesToRestrict: string[];
};

export type UserPermissionsGetQuery = {
  id: string;
}

export type UserPermissionsSwitchStatusQuery = {
  userId: string;
  permissionId: string;
}

