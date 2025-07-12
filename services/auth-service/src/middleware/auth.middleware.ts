// src/middleware/auth.middleware.ts
import { Metadata, status } from '@grpc/grpc-js';
import { JwtUtil } from '../utils/jwt.util';
import { logger } from '../config/logger.config';

export class AuthMiddleware {
  /**
   * Middleware para verificar token en llamadas protegidas
   */
  static authenticate(metadata: Metadata): { valid: boolean; userId?: string; error?: string } {
    try {
      const authHeader = metadata.get('authorization')[0] as string;
      
      if (!authHeader) {
        return {
          valid: false,
          error: 'Token de autorización requerido'
        };
      }

      const token = authHeader.replace('Bearer ', '');
      const payload = JwtUtil.verifyAccessToken(token);

      return {
        valid: true,
        userId: payload.userId
      };

    } catch (error) {
      logger.warn('Token inválido en middleware:', error);
      return {
        valid: false,
        error: 'Token inválido'
      };
    }
  }

  /**
   * Middleware para verificar roles específicos
   */
  static authorizeRole(allowedRoles: string[]) {
    return (metadata: Metadata): { authorized: boolean; error?: string } => {
      try {
        const authResult = this.authenticate(metadata);
        
        if (!authResult.valid) {
          return {
            authorized: false,
            error: authResult.error
          };
        }

        const authHeader = metadata.get('authorization')[0] as string;
        const token = authHeader.replace('Bearer ', '');
        const payload = JwtUtil.verifyAccessToken(token);

        const hasPermission = payload.roles.some(role => allowedRoles.includes(role));

        if (!hasPermission) {
          return {
            authorized: false,
            error: 'Permisos insuficientes'
          };
        }

        return { authorized: true };

      } catch (error) {
        logger.warn('Error en autorización de roles:', error);
        return {
          authorized: false,
          error: 'Error de autorización'
        };
      }
    };
  }
}