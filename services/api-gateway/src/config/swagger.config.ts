// src/config/swagger.config.ts
export const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pharmacy Control System API',
      version: '1.0.0',
      description: `
        API Gateway para el Sistema de Control de Farmacias.
        
        Este sistema permite gestionar inspecciones, medicamentos, usuarios y reportes
        a través de una arquitectura de microservicios.
        
        ## Autenticación
        La mayoría de endpoints requieren autenticación mediante JWT token en el header Authorization:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ## Microservicios
        - **Auth Service**: Autenticación y gestión de usuarios
        - **Pharmacy Service**: Gestión de farmacias
        - **Inspection Service**: Gestión de inspecciones
        - **Medication Service**: Gestión de medicamentos
        - **Report Service**: Generación de reportes
        - **Notification Service**: Envío de notificaciones
      `,
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@pharmacy-control.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.pharmacy-control.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtenido del endpoint /api/auth/login'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso faltante o inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: {
                    type: 'object',
                    properties: {
                      code: { type: 'string', example: 'UNAUTHORIZED' },
                      message: { type: 'string', example: 'Token de autorización requerido' },
                      timestamp: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        },
        ServiceUnavailable: {
          description: 'Servicio temporalmente no disponible',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: {
                    type: 'object',
                    properties: {
                      code: { type: 'string', example: 'SERVICE_UNAVAILABLE' },
                      message: { type: 'string', example: 'Servicio temporalmente no disponible' },
                      timestamp: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación en los datos enviados',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Datos de entrada inválidos' },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticación y gestión de usuarios'
      },
      {
        name: 'Health',
        description: 'Endpoints de monitoreo y salud del sistema'
      },
      {
        name: 'Pharmacies',
        description: 'Gestión de farmacias'
      },
      {
        name: 'Location',
        description: 'Gestión de ubicaciones'
      },
      {
        name: 'Supervision',
        description: 'Gestión de supervisiones'
      },
      {
        name: 'Reports',
        description: 'Generación y gestión de reportes'
      },
      {
        name: 'Notifications',
        description: 'Gestión de notificaciones'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/**/*.ts'
  ],
};