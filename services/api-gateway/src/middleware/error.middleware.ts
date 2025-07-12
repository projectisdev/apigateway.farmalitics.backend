// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.config';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log del error
  logger.error('Error en API Gateway:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode: error.statusCode || 500
  });

  // Respuesta por defecto
  let statusCode = error.statusCode || 500;
  let message = 'Error interno del servidor';
  let code = error.code || 'INTERNAL_ERROR';

  // Manejo de errores específicos
  if (error.message.includes('Auth Service no disponible')) {
    statusCode = 503;
    message = 'Servicio de autenticación temporalmente no disponible';
    code = 'SERVICE_UNAVAILABLE';
  } else if (error.message.includes('ECONNREFUSED')) {
    statusCode = 503;
    message = 'Servicio temporalmente no disponible';
    code = 'SERVICE_UNAVAILABLE';
  } else if (error.message.includes('Unauthorized')) {
    statusCode = 401;
    message = 'No autorizado';
    code = 'UNAUTHORIZED';
  } else if (error.message.includes('Forbidden')) {
    statusCode = 403;
    message = 'Acceso denegado';
    code = 'FORBIDDEN';
  } else if (error.message.includes('Not Found')) {
    statusCode = 404;
    message = 'Recurso no encontrado';
    code = 'NOT_FOUND';
  } else if (error.message.includes('Bad Request')) {
    statusCode = 400;
    message = 'Solicitud inválida';
    code = 'BAD_REQUEST';
  }

  // En desarrollo, incluir detalles del error
  const errorResponse: any = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  };

  // En desarrollo, agregar stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
    errorResponse.error.details = error.details;
  }

  res.status(statusCode).json(errorResponse);
};