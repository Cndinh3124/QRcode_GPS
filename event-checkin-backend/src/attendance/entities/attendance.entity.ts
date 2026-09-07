import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { Event } from '../../events/entities/event.entity';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  REJECTED = 'REJECTED',
}

@Entity('attendance')
@Index(
  'IDX_ATTENDANCE_EVENT_PARTICIPANT',
  ['event', 'participantCode'],
  {
    unique: true,
  },
)
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'event_id',
  })
  event: Event;

  @Column({
    type: 'varchar',
    length: 50,
  })
  participantCode: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  fullName: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  email: string | null;

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

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  distance: number;

  @Column({
    type: 'datetime',
  })
  checkInTime: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  device: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  ipAddress: string | null;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}