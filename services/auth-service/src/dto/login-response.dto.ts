import { UserResponseDto } from "./user-response.dto";

export class LoginResponseDto {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: UserResponseDto;

  constructor(data: Partial<LoginResponseDto>) {
    this.success = data.success ?? false;
    this.message = data.message ?? '';
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.user = data.user;
  }
}