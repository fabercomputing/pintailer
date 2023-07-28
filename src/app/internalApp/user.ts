import { Role } from './role'

export class UserLoginDetail {
  username: string;
  password: string;
}

export class UserProfileDetail {
  defaultOrganization: string;
  uniqueLDAPId: string;
  employeeNumber: string;
  userName: string;
  email: string;
  userOrganizationalRole: string[];
  userOrganizations: string[];
  userApplicationsAndRoles: string[];
  token: string;
}

export class UsersDetail {
  userName: string;
  fullName: string;
}

export class AssingUser {
  assetInfoId: number;
  assetUserId: string;
  startDate?: number;
  endDate?: number;
  createdBy?: string;
  modifiedBy?: string;
}

export class UserAllDetail {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  contactNumber: string;
  postalAddress: string;
  userName: string;
  groups: string;
}

export class OrganizationInfo {
  orgName: string;
}
