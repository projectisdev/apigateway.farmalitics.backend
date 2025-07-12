import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Role } from './role.entity';

@Entity('Usuarios')
export class User {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  id: number;

  @Column({ 
    name: 'nombre',
    type: 'varchar', 
    length: 50
  })
  firstName: string;

  @Column({ 
    name: 'apellido',
    type: 'varchar', 
    length: 50,
    nullable: true 
  })
  lastName: string | null;

  @Column({ 
    name: 'correo',
    type: 'varchar', 
    length: 100 
  })
  email: string;

  @Column({ 
    name: 'contrasena_hash',
    type: 'varchar', 
    length: 255 
  })
  password: string;

  @Column({ name: 'id_rol' })
  roleId: number;

  @CreateDateColumn({ 
    name: 'fecha_registro',
    type: 'datetime',
    default: () => 'GETDATE()'
  })
  createdAt: Date;

  // Relación Many-to-One con Role
  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'id_rol' })
  role: Role;

  // Métodos de conveniencia
  getFullName(): string {
    return `${this.firstName} ${this.lastName || ''}`.trim();
  }

  hasRole(roleName: string): boolean {
    return this.role?.name === roleName;
  }
}