import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class ValidationUtil {
  /**
   * Valida un DTO y retorna errores si los hay
   */
  static async validateDto<T extends object>(
    dtoClass: new () => T,
    data: any
  ): Promise<string[]> {
    const dto = plainToClass(dtoClass, data);
    const errors = await validate(dto);
    
    if (errors.length > 0) {
      return errors.flatMap(error => 
        Object.values(error.constraints || {})
      );
    }
    
    return [];
  }

  /**
   * Valida un email usando regex
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida la fortaleza de una contraseña
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}