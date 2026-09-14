export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  CUSTOMER: 'Customer'
};

export const ALL_ROLES = Object.values(ROLES);

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
export const STAFF_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR];
