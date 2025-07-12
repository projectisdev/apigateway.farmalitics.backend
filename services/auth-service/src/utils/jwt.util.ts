import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/jwt.config';

export interface JwtPayload {
  userId: number;
  email: string;
  roles: string;
}

const options: SignOptions = {
  expiresIn: "1h",
  issuer: config.issuer,
  audience: config.audience,
};

export class JwtUtil {
  /**
   * Genera un token de acceso
   */
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.accessTokenSecret,options);
  }

  /**
   * Genera un token de refresh
   */
  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.refreshTokenSecret,options);
  }

  /**
   * Verifica un token de acceso
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.accessTokenSecret, {
        issuer: config.issuer,
        audience: config.audience,
      }) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token de acceso inválido');
    }
  }

  /**
   * Verifica un token de refresh
   */
  static verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.refreshTokenSecret, {
        issuer: config.issuer,
        audience: config.audience,
      }) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token de refresh inválido');
    }
  }

  /**
   * Decodifica un token sin verificar (para obtener información)
   */
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Obtiene el tiempo de expiración de un token
   */
  static getTokenExpiration(token: string): number | null {
    const decoded = this.decodeToken(token);
    return decoded?.exp || null;
  }
}