import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CHECKING_IN = 'CHECKING_IN',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 200,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    length: 255,
  })
  locationName: string;

  @Column('decimal', {
    precision: 10,
    scale: 7,
  })
  latitude: number;

  @Column('decimal', {
    precision: 10,
    scale: 7,
  })
  longitude: number;

  @Column()
  radius: number;

  @Column({
    type: 'datetime',
  })
  startTime: Date;

  @Column({
    type: 'datetime',
  })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({
    unique: true,
  })
  qrToken: string;

  @ManyToOne(() => User)
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}