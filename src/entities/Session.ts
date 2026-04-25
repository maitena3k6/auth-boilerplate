import type { User } from './User.js';
// Session.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    BaseEntity,
    RelationId,
} from 'typeorm';

@Entity('sessions')
export class Session extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    token: string;

    @ManyToOne('User', (user: User) => user.sessions)
    user: User;

    @RelationId((session: Session) => session.user)
    userId: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ default: true })
    isValid: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
