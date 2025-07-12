// src/controllers/auth.controller.ts
import { sendUnaryData, ServerUnaryCall } from '@grpc/grpc-js';
import { AuthService } from '../services/auth.service';
import { logger } from '../config/logger.config';
import { CreateUserDto } from '../dto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Maneja el login de usuarios
   */
  async login(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>): Promise<void> {
    try {
      const {email, password} = call.request;
      
      logger.info(`Login attempt for: ${email}`);

      // Validar datos de entrada
      if (!email || !password) {
        return callback(null, {
          success: false,
          message: 'Email o contraseña son obligatorios'
        });
      }

      const result = await this.authService.login({ email, password });

      // Crear respuesta simple
      const response = {
        success: result.success,
        message: result.message,
        access_token: result.accessToken || '',
        user: result.user ? {
          id: result.user.id,
          email: result.user.email,
          first_name: result.user.firstName,
          last_name: result.user.lastName,
          roles: result.user.roles
        } : null
      };

      callback(null, response);

    } catch (error) {
      logger.error('Login error:', error);
      callback(null, {
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Valida un token JWT
   */
  async validateToken(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>): Promise<void> {
    try {
      const {token} = call.request;
      
      if (!token) {
        return callback(null, { valid: false });
      }

      const result = await this.authService.validateToken(token);

      callback(null, {
        valid: result.valid,
        user_id: result.userId || '',
        email: result.email || '',
        roles: result.roles || []
      });

    } catch (error) {
      logger.error('Token validation error:', error);
      callback(null, { valid: false });
    }
  }

    /**
   * Crear nuevo usuario
   */
  async createUser(call:ServerUnaryCall<any, any>, callback:sendUnaryData<any>){
    try {
      const {email, password, first_name, last_name, role_id} = call.request;
      logger.info(`Create user attempt for: ${email}`);

      // Validar datos de entrada
      if (!email || !password || !first_name || !last_name) {
        return callback(null, {
          success: false,
          message: 'Email, contraseña, nombre y apellido son obligatorios'
        });
      }

      // Crear DTO
      const createUserDto: CreateUserDto ={
        email,
        password,
        firstName:first_name,
        lastName:last_name, 
        roleId:role_id || undefined 
      }

      const result = await this.authService.createUser(createUserDto);

      const res = {
        success: result.success,
        message: result.message,
        user: result.user ? {
          id: result.user.id,
          email: result.user.email,
          first_name: result.user.firstName,
          last_name: result.user.lastName,
          roles: result.user.roles
        } : null
      }

      callback(null, res);
    } catch (error) {
      logger.error('Create user error:', error);
      callback(null, {
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  }