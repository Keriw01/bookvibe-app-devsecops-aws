export interface RoleDto {
  name: string;
}

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: RoleDto;
}