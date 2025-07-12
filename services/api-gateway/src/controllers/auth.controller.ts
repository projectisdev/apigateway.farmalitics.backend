import { NextFunction, Response,Request } from "express";
import { validationResult } from "express-validator";
import { logger } from "../config/logger.config";
import { authClient } from "../clients/auth.client";

export class AuthController {
    static async login (req: Request, res: Response, next: NextFunction) {
      try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: errors.array()
          });
        }
    
        const { email, password } = req.body;
    
        logger.info(`Intento de login para: ${email}`);
    
        // Llamar al microservicio de auth via gRPC
        const response = await authClient.login({ email, password });
    
        // Log del resultado (sin incluir el token completo por seguridad)
        logger.info(`Login ${response.success ? 'exitoso' : 'fallido'} para: ${email}`);
    
        // Enviar respuesta
        res.status(response.success ? 200 : 401).json(response);
    
      } catch (error) {
        logger.error('Error en endpoint login:', error);
        next(error);
      }
    }

    static async register (req:Request, res:Response, next:NextFunction){
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: errors.array()
                  }); 
            }
            
            const { email, password, first_name, last_name, role_id } = req.body;
            logger.info(`Intento de registro para: ${email}`);
            const response = await authClient.createUser({email, password, first_name, last_name, role_id});
            logger.info(`Registro ${response.success ? 'exitoso' : 'fallido'} para: ${email}`);
            res.status(response.success ? 200 : 401).json(response);

        } catch (error) {
            logger.error('Error en endpoint register:', error);
            next(error);
        }
    }
}