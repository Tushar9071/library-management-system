import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetUsersDto extends PaginationDto {
  role?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: {
    id: string;
    name: string;
  };
  status: string;
  createdAt: string;
  lastLogin: string;
}

export interface UserRoleResponse {
  id: string;
  name: string;
}
