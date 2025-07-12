// src/grpc-server.ts
import { Server, ServerCredentials, loadPackageDefinition } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import path from 'path';
import { AuthController } from './controllers/auth.controller';
import { AppDataSource } from './config/database.config';
import { grpcConfig } from './config/grpc.config';
import { logger } from './config/logger.config';
// import { createTestUser } from './seeds/create-test-user';

export class GrpcServer {
  private server: Server;
  private authController: AuthController;

  constructor() {
    this.server = new Server({
      'grpc.max_receive_message_length': grpcConfig.maxReceiveMessageLength,
      'grpc.max_send_message_length': grpcConfig.maxSendMessageLength,
    });
    
    this.authController = new AuthController();
    this.setupServices();
  }

  private setupServices(): void {
    const PROTO_PATH = path.join(__dirname, '../../../shared/proto/auth.proto');
    
    const packageDefinition = loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const authProto = loadPackageDefinition(packageDefinition) as any;

    this.server.addService(authProto.auth.AuthService.service, {
      Login: this.authController.login.bind(this.authController),
      ValidateToken: this.authController.validateToken.bind(this.authController),
      CreateUser: this.authController.createUser.bind(this.authController)
    });

    logger.info('Servicios gRPC configurados correctamente');
  }

  async start(): Promise<void> {
    try {
      await this.initializeDatabase();
      const bindAddress = `${grpcConfig.host}:${grpcConfig.port}`;
      
      this.server.bindAsync(
        bindAddress,
        ServerCredentials.createInsecure(),
        (error, port) => {
          if (error) {
            logger.error('Error iniciando servidor gRPC:', error);
            throw error;
          }

          this.server.start();
          logger.info(`🚀 Servidor gRPC Auth Service iniciado en ${bindAddress}`);
          logger.info(`📊 Puerto: ${port}`);
          logger.info(`🏥 Base de datos: SQL Server`);
          logger.info(`🛡️  Autenticación: JWT`);
        }
      );

      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Error iniciando servidor:', error);
      process.exit(1);
    }
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await AppDataSource.initialize();
      logger.info('✅ Conexión a MSSQL establecida correctamente');

      // if (process.env.NODE_ENV === 'development') {
      //   await AppDataSource.synchronize();
      //   logger.info('🔄 Esquema de base de datos sincronizado');
      // }
      // await this.createDefaultRoles();

    } catch (error) {
      logger.error('❌ Error conectando a la base de datos:', error);
      throw error;
    }
  }

  // private async createDefaultRoles(): Promise<void> {
  //   try {
  //     const roleRepository = AppDataSource.getRepository('Role');
      
  //     const defaultRoles = [
  //       { name: 'Administrador' },
  //       { name: 'Supervisor' },
  //       { name: 'Inspector' },
  //       { name: 'Analista' }
  //     ];

  //     for (const roleData of defaultRoles) {
  //       const existingRole = await roleRepository.findOne({
  //         where: { name: roleData.name }
  //       });

  //       if (!existingRole) {
  //         const role = roleRepository.create(roleData);
  //         await roleRepository.save(role);
  //         logger.info(`✅ Rol creado: ${roleData.name}`);
  //       }
  //     }

  //   } catch (error) {
  //     logger.error('Error creando roles por defecto:', error);
  //   }
  // }

  private setupGracefulShutdown(): void {
    const signals = ['SIGTERM', 'SIGINT'];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`🛑 Recibida señal ${signal}, cerrando servidor...`);
        
        this.server.tryShutdown(async (error) => {
          if (error) {
            logger.error('Error durante shutdown:', error);
            process.exit(1);
          }

          try {
            await AppDataSource.destroy();
            logger.info('✅ Conexión a base de datos cerrada');
            logger.info('👋 Servidor cerrado correctamente');
            process.exit(0);
          } catch (dbError) {
            logger.error('Error cerrando base de datos:', dbError);
            process.exit(1);
          }
        });
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.tryShutdown(async (error) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          await AppDataSource.destroy();
          resolve();
        } catch (dbError) {
          reject(dbError);
        }
      });
    });
  }

  getHealthStatus(): {
    status: string;
    uptime: number;
    database: string;
    timestamp: string;
  } {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}