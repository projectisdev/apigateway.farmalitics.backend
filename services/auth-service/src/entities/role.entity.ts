// src/entities/role.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from 'typeorm';
import { User } from './user.entity';

@Entity('Roles')
export class Role {
  @PrimaryGeneratedColumn({ name: 'id_rol' })
  id: number;

  @Column({ 
    name: 'nombre_rol',
    type: 'varchar', 
    length: 50 
  })
  name: string;

  // Relación One-to-Many con Usuarios
  @OneToMany(() => User, user => user.role)
  users: User[];
}