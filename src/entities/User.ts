import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    OneToMany,
    BaseEntity,
} from 'typeorm';
import { Role } from './Role';
import { Session } from './Session';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ unique: true, length: 50 })
    username: string;

    @Column({ select: false })
    password: string;

    @Column({ nullable: true, length: 100 })
    firstName: string;

    @Column({ nullable: true, length: 100 })
    lastName: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ nullable: true })
    emailVerificationToken: string;

    @Column({ nullable: true })
    resetPasswordToken: string;

    @Column({ type: 'timestamp', nullable: true })
    resetPasswordExpires: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastLogin: Date;

    @ManyToMany(() => Role, (role) => role.users)
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'userId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
    })
    roles: Role[];

    @OneToMany(() => Session, (session) => session.user)
    sessions: Session[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
