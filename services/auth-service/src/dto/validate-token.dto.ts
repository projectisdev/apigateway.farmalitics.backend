import { IsNotEmpty, IsJWT } from 'class-validator';

export class ValidateTokenDto {
  @IsNotEmpty({ message: 'El token es obligatorio' })
  @IsJWT({ message: 'El token debe ser un JWT válido' })
  token: string;
}
