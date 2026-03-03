export interface ICurrentUser {
  id: string;
  displayName: string;
  email: string;
  roles: IRole[];
}

export interface IRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface IPermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}
