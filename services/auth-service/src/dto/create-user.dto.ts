import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName: string;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del rol debe ser un número' })
  roleId?: number;
}