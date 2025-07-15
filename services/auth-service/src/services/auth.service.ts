// src/services/auth.service.ts
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { AppDataSource } from "../config/database.config";
import { HashUtil } from "../utils/hash.util";
import { JwtUtil, JwtPayload } from "../utils/jwt.util";
import { ValidationUtil } from "../utils/validation.util";
import {
  LoginDto,
  CreateUserDto,
  UserResponseDto,
  LoginResponseDto,
} from "../dto/index";
import { logger } from "../config/logger.config";

export class AuthService {
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  /**
   * Autenticar usuario con email y contraseña
   */
  async login(loginData: LoginDto): Promise<LoginResponseDto> {
    try {
      logger.info(`Intento de login para: ${loginData.email}`);

      // Validar DTO
      const validationErrors = await ValidationUtil.validateDto(
        LoginDto,
        loginData
      );
      if (validationErrors.length > 0) {
        return new LoginResponseDto({
          success: false,
          message: `Errores de validación: ${validationErrors.join(", ")}`,
        });
      }

      // Buscar usuario por email
      const user = await this.userRepository.findOne({
        where: { email: loginData.email.toLowerCase() },
        relations: ["role"],
      });

      if (!user) {
        logger.warn(`Usuario no encontrado: ${loginData.email}`);
        return new LoginResponseDto({
          success: false,
          message: "Credenciales inválidas",
        });
      }
      // Verificar contraseña
      const isPasswordValid = await HashUtil.comparePassword(
        loginData.password,
        user.password
      );

      if (!isPasswordValid) {
        logger.warn(`Contraseña incorrecta para: ${loginData.email}`);
        return new LoginResponseDto({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      await this.userRepository.save(user);

      // Generar tokens
      const jwtPayload: JwtPayload = {
        userId: user.id,
        email: user.email,
        roles: user.role.name,
      };

      const accessToken = JwtUtil.generateAccessToken(jwtPayload);
      const refreshToken = JwtUtil.generateRefreshToken(jwtPayload);

      logger.info(`Login exitoso para: ${loginData.email}`);

      return new LoginResponseDto({
        success: true,
        message: "Login exitoso",
        accessToken,
        refreshToken,
        user: new UserResponseDto(user),
      });
    } catch (error) {
      logger.error("Error en login:", error);
      return new LoginResponseDto({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  /**
   * Validar token JWT
   */
  async validateToken(token: string): Promise<{
    valid: boolean;
    userId?: number;
    email?: string;
    roles?: string;
    expiresAt?: number;
    message?: string;
  }> {
    try {
      // Verificar el token
      const payload = JwtUtil.verifyAccessToken(token);

      // Verificar que el usuario siga existiendo y activo
      const user = await this.userRepository.findOne({
        where: { id: payload.userId },
        relations: ["roles"],
      });

      if (!user) {
        return {
          valid: false,
          message: "Usuario no encontrado o inactivo",
        };
      }

      const expiresAt = JwtUtil.getTokenExpiration(token);

      return {
        valid: true,
        userId: payload.userId,
        email: payload.email,
        roles: user.role.name,
        expiresAt: expiresAt || undefined,
      };
    } catch (error) {
      logger.warn("Token inválido:", error);
      return {
        valid: false,
        message: "Token inválido o expirado",
      };
    }
  }

  /**
   * Obtener información de usuario por ID
   */
  async getUserInfo(userId: number): Promise<{
    success: boolean;
    user?: UserResponseDto;
    message?: string;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ["roles"],
      });

      if (!user) {
        return {
          success: false,
          message: "Usuario no encontrado",
        };
      }

      return {
        success: true,
        user: new UserResponseDto(user),
      };
    } catch (error) {
      logger.error("Error obteniendo información de usuario:", error);
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }

  /**
   * Crear nuevo usuario
   */

  async createUser(UserData: CreateUserDto): Promise<{
    success: boolean;
    message?: string;
    user?: UserResponseDto;
  }> {
    try {
      const validate = await ValidationUtil.validateDto(
        CreateUserDto,
        UserData
      );
      if (validate.length > 0) {
        return {
          success: false,
          message: `Errores de validación: ${validate.join(", ")}`,
        };
      }
      const { password } = UserData;
      // validar que la clave sea fuerte
      const passwordValidation =
        ValidationUtil.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: `Contraseña débil: ${passwordValidation.errors.join(", ")}`,
        };
      }
  
      // Encriptar contraseña
      const hashedPassword = await HashUtil.hashPassword(password);
  
      let roleId = UserData.roleId;
      if (!roleId) {
        const defaultRole = await AppDataSource.getRepository(Role).findOne({
          where: { name: "USER" },
        });
        roleId = defaultRole?.id || 1;
      }
  
      // Ejecutar stored procedure MySQL
      await AppDataSource.query(
        `CALL sp_crear_usuario(?, ?, ?, ?, ?, @exitoso, @mensaje)`,
        [
          UserData.firstName,
          UserData.lastName || null, // Manejar apellido nulo
          UserData.email.toLowerCase(),
          hashedPassword,
          roleId,
        ]
      );
  
      // Obtener los valores de los parámetros OUT
      const result = await AppDataSource.query(
        `SELECT @exitoso as exitoso, @mensaje as mensaje`
      );
  
      // Verificar resultado del SP
      const { exitoso, mensaje } = result[0];
      if (!exitoso) {
        return {
          success: false,
          message: mensaje,
        };
      }
  
      // Buscar el usuario recién creado por email ya que MySQL SP no retorna ID
      const createdUser = await this.userRepository.findOne({
        where: { email: UserData.email.toLowerCase() },
        relations: ["role"],
      });
  
      if (!createdUser) {
        return {
          success: false,
          message: "Error: Usuario no encontrado después de la creación",
        };
      }
  
      console.info(`Usuario creado exitosamente: ${UserData.email}`);
      return {
        success: true,
        message: "Usuario creado exitosamente",
        user: new UserResponseDto(createdUser),
      };
    } catch (error: any) {
      console.error("Error creando usuario:", error);
  
      // Manejar errores específicos de MySQL
      if (
        error.message.includes("Duplicate entry") ||
        error.message.includes("ER_DUP_ENTRY") ||
        error.code === "ER_DUP_ENTRY"
      ) {
        return {
          success: false,
          message: "El email ya está registrado",
        };
      }
  
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }

  /**
   * Cerrar sesión (invalidar token)
   * En una implementación completa, aquí agregarías el token a una blacklist
   */
  async logout(
    token: string,
    userId: number
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Validar que el token pertenece al usuario
      const tokenValidation = await this.validateToken(token);

      if (!tokenValidation.valid || tokenValidation.userId !== userId) {
        return {
          success: false,
          message: "Token inválido",
        };
      }

      // TODO: Implementar blacklist de tokens para invalidarlos
      // Por ahora solo registramos el logout
      logger.info(`Usuario ${userId} cerró sesión`);

      return {
        success: true,
        message: "Sesión cerrada exitosamente",
      };
    } catch (error) {
      logger.error("Error en logout:", error);
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }

  /**
   * Verificar si un usuario tiene un rol específico
   */
  async hasRole(userId: number, roleName: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ["roles"],
      });

      return user ? user.hasRole(roleName) : false;
    } catch (error) {
      logger.error("Error verificando rol:", error);
      return false;
    }
  }

  /**
   * Cambiar estado activo de un usuario
   */
  // async toggleUserStatus(userId: number): Promise<{
  //   success: boolean;
  //   message: string;
  //   isActive?: boolean;
  // }> {
  //   try {
  //     const user = await this.userRepository.findOne({
  //       where: { id: userId }
  //     });

  //     if (!user) {
  //       return {
  //         success: false,
  //         message: 'Usuario no encontrado'
  //       };
  //     }

  //     user.isActive = !user.isActive;
  //     await this.userRepository.save(user);

  //     logger.info(`Estado del usuario ${userId} cambiado a: ${user.isActive}`);

  //     return {
  //       success: true,
  //       message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
  //       isActive: user.isActive
  //     };

  //   } catch (error) {
  //     logger.error('Error cambiando estado de usuario:', error);
  //     return {
  //       success: false,
  //       message: 'Error interno del servidor'
  //     };
  //   }
  // }
}
