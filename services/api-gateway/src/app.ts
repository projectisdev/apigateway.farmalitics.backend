import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import colors from 'colors';

import { logger } from './config/logger.config';
import { errorHandler } from './middleware/error.middleware';
import { authRoutes } from './routes/auth.routes';
import { healthRoutes } from './routes/health.routes';
import { swaggerConfig } from './config/swagger.config';

import db from './config/db';
import pharmacyRoutes from './routes/pharmacy.routes'; 
import locationRoutes from './routes/location.routes';
import supervisionRoutes from './routes/supervision.routes';
import medicineTypeRoutes from './routes/medicinetype.route';
import { reportRoutes } from './routes/report.routes';


dotenv.config();

class ApiGateway {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());

    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
    ];
    this.app.use(cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'DELETE', 'PUT'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    this.app.use(compression());

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    this.app.use(morgan('dev'));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }
private initializeRoutes(): void {
  this.app.use('/health', healthRoutes);
  this.app.use('/api/auth', authRoutes);
  this.app.use('/api/report', reportRoutes);

  // ✅ Farmacias sin prefijo /api
  this.app.use('/', pharmacyRoutes);

  // Rutas para ubicación bajo /api/location
  this.app.use('/api/location', locationRoutes);
  this.app.use('/', supervisionRoutes);
  this.app.use('/', medicineTypeRoutes);


  this.app.get('/', (req: Request, res: Response) => {
    res.json({
      message: 'Pharmacy Control System - API Gateway',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        pharmacies: '/pharmacies',
        location: '/api/location',
        docs: '/api-docs',
      },
    });
  });

    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Endpoint no encontrado',
        method: req.method,
        url: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeSwagger(): void {
    const specs = swaggerJSDoc(swaggerConfig);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      await db.query('SELECT 1');
      console.log(colors.green.bold('✅ Base de datos conectada correctamente'));
    } catch (error: any) {
      console.error(colors.red.bold(`❌ Error de conexión a la base de datos: ${error.message}`));
      process.exit(1);
    }

    this.app.listen(this.port, () => {
      logger.info(`🚀 API Gateway iniciado en puerto ${this.port}`);
      logger.info(`📖 Documentación disponible en http://localhost:${this.port}/api-docs`);
      logger.info('🏥 Pharmacy Control System API Gateway v1.0.0');
      console.log(colors.green.bold(`✅ Servidor escuchando en http://localhost:${this.port}`));
      console.log(colors.cyan.bold(`📄 Swagger disponible en http://localhost:${this.port}/api-docs`));
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

if (require.main === module) {
  const gateway = new ApiGateway();
  gateway.start();
}

export default ApiGateway;