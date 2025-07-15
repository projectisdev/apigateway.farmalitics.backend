import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // Solo en desarrollo en produccion esta opcion debe estar "falsa76666666666666666666666666666666666666668" 
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Role],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts']
});