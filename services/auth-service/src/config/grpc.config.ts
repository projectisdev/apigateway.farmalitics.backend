export const grpcConfig = {
  port: process.env.GRPC_PORT || '50051',
  host: process.env.GRPC_HOST || '0.0.0.0',
  maxReceiveMessageLength: 4 * 1024 * 1024, // 4MB
  maxSendMessageLength: 4 * 1024 * 1024, // 4MB
};