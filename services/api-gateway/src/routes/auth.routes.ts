// src/routes/auth.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authClient } from '../clients/auth.client';
import { logger } from '../config/logger.config';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@test.com
 *         password:
 *           type: string
 *           minimum: 6
 *           example: password123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         access_token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autenticar usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', [
  // Validaciones
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .trim()
], AuthController.login);

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *         - role_id
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *           example: fulano@gmail.com
 *         password:
 *           type: string
 *           minimum: 6
 *           description: Contraseña del usuario (mínimo 6 caracteres)
 *           example: password123
 *         first_name:
 *           type: string
 *           minimum: 2
 *           description: Nombre del usuario
 *           example: fulano
 *         last_name:
 *           type: string
 *           minimum: 2
 *           description: Apellido del usuario
 *           example: Culo grande
 *         role_id:
 *           type: integer
 *           description: ID del rol que se asignará al usuario
 *           example: 1
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *           example: true
 *         message:
 *           type: string
 *           description: Mensaje descriptivo del resultado de la operación
 *           example: "Usuario creado exitosamente"
 *         user:
 *           type: object
 *           description: Información del usuario creado
 *           properties:
 *             id:
 *               type: string
 *               description: ID único del usuario en el sistema
 *               example: "1"
 *             email:
 *               type: string
 *               format: email
 *               description: Correo electrónico del usuario
 *               example: "fulano@gmail.com"
 *             first_name:
 *               type: string
 *               description: Nombre del usuario
 *               example: "fulano"
 *             last_name:
 *               type: string
 *               description: Apellido del usuario
 *               example: "Culo grande"
 *             roles:
 *               type: array
 *               description: Lista de roles asignados al usuario
 *               items:
 *                 type: string
 *               example: []
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario en el sistema
 *     description: Crea una nueva cuenta de usuario con la información proporcionada y asigna el rol especificado
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             usuario_inspector:
 *               summary: Registro de usuario inspector
 *               value:
 *                 email: "inspector@pharmacy.com"
 *                 password: "password123"
 *                 first_name: "Juan"
 *                 last_name: "Pérez"
 *                 role_id: 3
 *             usuario_admin:
 *               summary: Registro de usuario administrador
 *               value:
 *                 email: "admin@pharmacy.com"
 *                 password: "securepass456"
 *                 first_name: "María"
 *                 last_name: "González"
 *                 role_id: 1
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *             example:
 *               success: true
 *               message: "Usuario creado exitosamente"
 *               user:
 *                 id: "1"
 *                 email: "fulano@gmail.com"
 *                 first_name: "fulano"
 *                 last_name: "Culo grande"
 *                 roles: []
 *       400:
 *         description: Datos de entrada inválidos o email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Este correo ya existe"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *                   example:
 *                     - field: "email"
 *                       message: "Debe ser un email válido"
 *       422:
 *         description: Error de validación en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Errores de validación en los datos enviados"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.post('/register',[
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .trim(),
  body('first_name')
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres')
    .trim(),
  body('last_name')
    .isLength({ min: 2 })
    .withMessage('El apellido debe tener al menos 2 caracteres')
    .trim(),
    body('role_id')
    .isInt()
    .withMessage('El role_id debe ser un número entero')
    .trim(),
], AuthController.register);


/**
 * @swagger
 * /api/auth/validate:
 *   post:
 *     summary: Validar token de acceso
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token válido
 *       400:
 *         description: Token requerido
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/validate', [
  body('token')
    .notEmpty()
    .withMessage('Token es requerido')
    .trim()
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Token requerido',
        errors: errors.array()
      });
    }

    const { token } = req.body;

    // Llamar al microservicio de auth via gRPC
    const response = await authClient.validateToken({ token });

    // Enviar respuesta
    res.status(response.valid ? 200 : 401).json(response);

  } catch (error) {
    logger.error('Error en endpoint validate:', error);
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *       401:
 *         description: Token inválido o no proporcionado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorización requerido'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Validar token via gRPC
    const response = await authClient.validateToken({ token });

    if (!response.valid) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Enviar información del usuario
    res.json({
      success: true,
      user: {
        id: response.user_id,
        email: response.email,
        roles: response.roles
      }
    });

  } catch (error) {
    logger.error('Error en endpoint me:', error);
    next(error);
  }
});

export { router as authRoutes };