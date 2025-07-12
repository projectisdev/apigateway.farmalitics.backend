// src/seeds/create-test-user.ts
import { AppDataSource } from '../config/database.config';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { HashUtil } from '../utils/hash.util';
import { logger } from '../config/logger.config';

export async function createTestUser(): Promise<void> {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    // Verificar si ya existe el usuario de prueba
    const existingUser = await userRepository.findOne({
      where: { email: 'admin@test.com' }
    });

    if (existingUser) {
      logger.info('👤 Usuario de prueba ya existe');
      return;
    }

    // Buscar rol de Administrador
    const adminRole = await roleRepository.findOne({
      where: { name: 'Administrador' }
    });

    if (!adminRole) {
      logger.error('❌ No se encontró el rol de Administrador');
      return;
    }

    // Hash de la contraseña
    const passwordHash = await HashUtil.hashPassword('password123');

    // Crear usuario de prueba
    const testUser = userRepository.create({
      email: 'admin@test.com',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'Usuario',
      role: adminRole // Asignar el rol directamente
    });

    await userRepository.save(testUser);
    
    logger.info('✅ Usuario de prueba creado:');
    logger.info('📧 Email: admin@test.com');
    logger.info('🔑 Password: password123');
    logger.info('👥 Roles: Administrador');

  } catch (error) {
    logger.error('❌ Error creando usuario de prueba:', error);
  }
}