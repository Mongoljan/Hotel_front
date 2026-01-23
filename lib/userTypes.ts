export const USER_TYPES = {
  SUPER_ADMIN: 1,
  OWNER: 2,
  MANAGER: 3,
  RECEPTION: 4,
  USER: 5,
} as const;

export type UserTypeValue = typeof USER_TYPES[keyof typeof USER_TYPES];

export interface UserType {
  pk: number;
  name: string;
}

export const USER_TYPE_NAMES: Record<number, string> = {
  1: 'SuperAdmin',
  2: 'Owner',
  3: 'Manager',
  4: 'Reception',
  5: 'User',
};

// Define what each role can access
export const ROLE_PERMISSIONS = {
  [USER_TYPES.SUPER_ADMIN]: {
    canCreateHotel: true,
    canEditHotel: true,
    canDeleteHotel: true,
    canCreateEmployee: true,
    canManageRooms: true,
    canViewReports: true,
    canManagePricing: true,
    canManageBookings: true,
    canApproveUsers: true,
    canAccessSuperAdmin: true,
  },
  [USER_TYPES.OWNER]: {
    canCreateHotel: true,
    canEditHotel: true,
    canDeleteHotel: true,
    canCreateEmployee: true,
    canManageRooms: true,
    canViewReports: true,
    canManagePricing: true,
    canManageBookings: true,
    canApproveUsers: false,
    canAccessSuperAdmin: false,
  },
  [USER_TYPES.MANAGER]: {
    canCreateHotel: false,
    canEditHotel: false,
    canDeleteHotel: false,
    canCreateEmployee: false,
    canManageRooms: true,
    canViewReports: true,
    canManagePricing: true,
    canManageBookings: true,
    canApproveUsers: false,
    canAccessSuperAdmin: false,
  },
  [USER_TYPES.RECEPTION]: {
    canCreateHotel: false,
    canEditHotel: false,
    canDeleteHotel: false,
    canCreateEmployee: false,
    canManageRooms: false,
    canViewReports: false,
    canManagePricing: false,
    canManageBookings: true,
    canApproveUsers: false,
    canAccessSuperAdmin: false,
  },
  [USER_TYPES.USER]: {
    canCreateHotel: false,
    canEditHotel: false,
    canDeleteHotel: false,
    canCreateEmployee: false,
    canManageRooms: false,
    canViewReports: false,
    canManagePricing: false,
    canManageBookings: false,
    canApproveUsers: false,
    canAccessSuperAdmin: false,
  },
} as const;

export function hasPermission(userType: number, permission: keyof typeof ROLE_PERMISSIONS[typeof USER_TYPES.SUPER_ADMIN]): boolean {
  return ROLE_PERMISSIONS[userType as UserTypeValue]?.[permission] ?? false;
}

export function canAccessAdminPanel(userType: number): boolean {
  return userType >= USER_TYPES.RECEPTION && userType <= USER_TYPES.OWNER || userType === USER_TYPES.SUPER_ADMIN;
}

export function isSuperAdmin(userType: number): boolean {
  return userType === USER_TYPES.SUPER_ADMIN;
}

export function isOwner(userType: number): boolean {
  return userType === USER_TYPES.OWNER;
}

export function isManager(userType: number): boolean {
  return userType === USER_TYPES.MANAGER;
}

export function isReception(userType: number): boolean {
  return userType === USER_TYPES.RECEPTION;
}
