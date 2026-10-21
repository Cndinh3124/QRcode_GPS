export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  studentCode: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserDto {
  studentCode?: string;
  fullName?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}

/**
 * Dùng cho API phân trang trong tương lai.
 * Hiện tại backend trả về User[] nên chưa sử dụng.
 */
export interface UsersResponse {
  data: User[];
  total: number;
}