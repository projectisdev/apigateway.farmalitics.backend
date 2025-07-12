// src/app.ts
import "reflect-metadata";
import "dotenv/config";
import { GrpcServer } from "./grpc-server";
import { logger } from "./config/logger.config";

async function main(): Promise<void> {
  try {
    logger.info("🚀 Iniciando Auth Service...");
    const server = new GrpcServer();
    await server.start();
  } catch (error) {
    logger.error("❌ Error fatal iniciando aplicación:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection en:", promise, "razón:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

if (require.main === module) {
  main();
}

export { GrpcServer };
