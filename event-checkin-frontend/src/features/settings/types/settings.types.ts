export interface UserRole {
  id: string;
  name: string;
  description?: string;
}

export interface UserProfile {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  studentCode?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}