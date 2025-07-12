// src/clients/auth.client.ts
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { logger } from "../config/logger.config";

// Interfaces para tipado
export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  user?: UserData;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  access_token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}

export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

export interface ValidateTokenRequest {
  token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user_id?: string;
  email?: string;
  roles?: string[];
}

class AuthGrpcClient {
  private client: any;
  private isConnected: boolean = false;

  constructor() {
    this.initializeClient();
  }

  /**
   * Inicializar cliente gRPC
   */
  private initializeClient(): void {
    try {
      // Cargar definición del proto
      const PROTO_PATH = path.join(
        __dirname,
        "../../../../shared/proto/auth.proto"
      );

      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const authProto = grpc.loadPackageDefinition(packageDefinition) as any;

      // Crear cliente
      const AUTH_SERVICE_URL =
        process.env.AUTH_SERVICE_URL || "localhost:50051";

      this.client = new authProto.auth.AuthService(
        AUTH_SERVICE_URL,
        grpc.credentials.createInsecure()
      );

      // Verificar conexión
      this.checkConnection();

      logger.info(`🔗 Cliente gRPC Auth conectado a ${AUTH_SERVICE_URL}`);
    } catch (error) {
      logger.error("❌ Error inicializando cliente gRPC Auth:", error);
      throw error;
    }
  }

  /**
   * Verificar conexión con el servicio
   */
  private checkConnection(): void {
    this.client.waitForReady(Date.now() + 5000, (error: any) => {
      if (error) {
        logger.error("❌ No se puede conectar al Auth Service:", error.message);
        this.isConnected = false;
      } else {
        logger.info("✅ Conectado al Auth Service");
        this.isConnected = true;
      }
    });
  }

  /**
   * Login de usuario
   */
  public async login(loginData: LoginRequest): Promise<LoginResponse> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Auth Service no disponible"));
        return;
      }

      this.client.Login(loginData, (error: any, response: LoginResponse) => {
        if (error) {
          logger.error("Error en login gRPC:", error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Validar token
   */
  public async validateToken(
    tokenData: ValidateTokenRequest
  ): Promise<ValidateTokenResponse> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Auth Service no disponible"));
        return;
      }

      this.client.ValidateToken(
        tokenData,
        (error: any, response: ValidateTokenResponse) => {
          if (error) {
            logger.error("Error en validación de token gRPC:", error);
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  public async createUser(
    userData: CreateUserRequest
  ): Promise<CreateUserResponse> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Auth Service no disponible"));
        return;
      }

      this.client.CreateUser(
        userData,
        (error: any, response: CreateUserResponse) => {
          if (error) {
            logger.error("Error en creación de usuario gRPC:", error);
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  /**
   * Verificar si el cliente está conectado
   */
  public isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Cerrar conexión
   */
  public close(): void {
    if (this.client) {
      this.client.close();
      this.isConnected = false;
      logger.info("🔌 Cliente gRPC Auth desconectado");
    }
  }
}

// Singleton instance
export const authClient = new AuthGrpcClient();
