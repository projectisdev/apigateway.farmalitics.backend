// src/routes/health.routes.ts
import { Router, Request, Response } from 'express';
import { authClient } from '../clients/auth.client';
import { logger } from '../config/logger.config';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del API Gateway
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API Gateway funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 123.456
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        auth: await checkAuthService()
      }
    };

    res.json(healthCheck);
  } catch (error) {
    logger.error('Error en health check:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Verificar si el API Gateway está listo para recibir tráfico
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Gateway listo
 *       503:
 *         description: Gateway no listo
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Verificar conexiones a servicios críticos
    const authReady = authClient.isReady();

    if (authReady) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          auth: 'ready'
        }
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        services: {
          auth: 'not ready'
        }
      });
    }
  } catch (error) {
    logger.error('Error en readiness check:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed'
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Verificar si el API Gateway está vivo
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Gateway vivo
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Verificar estado del servicio de autenticación
 */
async function checkAuthService(): Promise<string> {
  try {
    if (authClient.isReady()) {
      return 'healthy';
    } else {
      return 'unhealthy';
    }
  } catch (error) {
    logger.error('Error verificando Auth Service:', error);
    return 'error';
  }
}

export { router as healthRoutes };