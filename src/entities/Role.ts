import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, BaseEntity } from 'typeorm';
import { User } from './User';

@Entity('roles')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string; // 'admin', 'user', 'moderator'

  @Column({ length: 200, nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  permissions: string[]; // ['create:user', 'edit:product', 'delete:post']

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;
}