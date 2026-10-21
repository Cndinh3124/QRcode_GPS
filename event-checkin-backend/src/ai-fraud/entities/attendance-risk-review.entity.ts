import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import {
  AttendanceRiskAssessment,
  ReviewDecision,
} from './attendance-risk-assessment.entity';

@Entity('attendance_risk_reviews')
@Index('IDX_RISK_REVIEW_HISTORY', ['assessment', 'createdAt'])
export class AttendanceRiskReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AttendanceRiskAssessment, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'assessment_id' })
  assessment: AttendanceRiskAssessment;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User | null;

  @Column({ type: 'enum', enum: ReviewDecision })
  decision: ReviewDecision;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  note: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
